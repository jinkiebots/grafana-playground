import { css, injectGlobal } from '@emotion/css';
import { isNumber } from 'lodash';
import { memo, useCallback, useEffect, useRef } from 'react';

import {
  DisplayValueAlignmentFactors,
  FieldDisplay,
  FieldType,
  getDisplayValueAlignmentFactors,
  getFieldDisplayValues,
  NumericRange,
  PanelProps,
} from '@grafana/data';
import { findNumericFieldMinMax } from '@grafana/data/internal';
import { BigValueTextMode, BigValueGraphMode } from '@grafana/schema';
import { BigValue, DataLinksContextMenu, useTheme2, VizRepeater, VizRepeaterRenderValueProps } from '@grafana/ui';
import { DataLinksContextMenuApi } from '@grafana/ui/internal';

import { Options } from './panelcfg.gen';

export const StatPanel = memo(
  ({
    timeRange,
    options,
    fieldConfig,
    title,
    data,
    replaceVariables,
    timeZone,
    height,
    width,
    renderCounter,
  }: PanelProps<Options>) => {
    const theme = useTheme2();

    const getTextMode = useCallback(() => {
      // If we have manually set displayName or panel title switch text mode to value and name
      if (options.textMode === BigValueTextMode.Auto && (fieldConfig.defaults.displayName || !title)) {
        return BigValueTextMode.ValueAndName;
      }

      return options.textMode;
    }, [options.textMode, fieldConfig.defaults.displayName, title]);

    const renderComponent = useCallback(
      (
        valueProps: VizRepeaterRenderValueProps<FieldDisplay, DisplayValueAlignmentFactors>,
        menuProps: DataLinksContextMenuApi
      ): JSX.Element => {
        const { value, alignmentFactors, width, height, count } = valueProps;
        const { openMenu, targetClassName } = menuProps;
        let sparkline = value.sparkline;
        if (sparkline) {
          sparkline.timeRange = timeRange;
        }

        return (
          <BigValue
            value={value.display}
            count={count}
            sparkline={sparkline}
            colorMode={options.colorMode}
            graphMode={options.graphMode}
            justifyMode={options.justifyMode}
            textMode={getTextMode()}
            alignmentFactors={alignmentFactors}
            text={options.text}
            width={width}
            height={height}
            theme={theme}
            onClick={openMenu}
            className={targetClassName}
            disableWideLayout={!options.wideLayout}
            percentChangeColorMode={options.percentChangeColorMode}
          />
        );
      },
      [theme, timeRange, options, getTextMode]
    );

    const renderValue = useCallback(
      (valueProps: VizRepeaterRenderValueProps<FieldDisplay, DisplayValueAlignmentFactors>): JSX.Element => {
        const { value } = valueProps;
        const { getLinks, hasLinks } = value;

        if (hasLinks && getLinks) {
          return (
            <DataLinksContextMenu links={getLinks}>
              {(api) => {
                return renderComponent(valueProps, api);
              }}
            </DataLinksContextMenu>
          );
        }

        return renderComponent(valueProps, {});
      },
      [renderComponent]
    );

    const getValues = useCallback((): FieldDisplay[] => {
      let globalRange: NumericRange | undefined = undefined;

      for (let frame of data.series) {
        for (let field of frame.fields) {
          let { config } = field;
          // mostly copied from fieldOverrides, since they are skipped during streaming
          // Set the Min/Max value automatically
          if (field.type === FieldType.number) {
            if (field.state?.range) {
              continue;
            }
            if (!globalRange && (!isNumber(config.min) || !isNumber(config.max))) {
              globalRange = findNumericFieldMinMax(data.series);
            }
            const min = config.min ?? globalRange!.min;
            const max = config.max ?? globalRange!.max;
            field.state = field.state ?? {};
            field.state.range = { min, max, delta: max! - min! };
          }
        }
      }

      return getFieldDisplayValues({
        fieldConfig,
        reduceOptions: options.reduceOptions,
        replaceVariables,
        theme,
        data: data.series,
        sparkline: options.graphMode !== BigValueGraphMode.None,
        percentChange: options.showPercentChange,
        timeZone,
      });
    }, [data, fieldConfig, theme, options, replaceVariables, timeZone]);

    // Custom styling for gradient backgrounds and additional text
    const customGradient = (options as any).customGradient;
    const customBackground = (options as any).customBackground;
    const customBottomText = (options as any).customBottomText;
    const customBottomTextColor = (options as any).customBottomTextColor;
    const customTitleColor = (options as any).customTitleColor;

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Apply custom background to panel header
    useEffect(() => {
      if ((customGradient || customBackground) && wrapperRef.current) {
        const background = customGradient || customBackground;

        // Find the panel container by traversing up
        let element: HTMLElement | null = wrapperRef.current;
        let attempts = 0;

        while (element && attempts < 10) {
          element = element.parentElement;
          attempts++;

          // Look for panel chrome container
          if (element) {
            // Try to find header in this container
            const header = element.querySelector('[class*="panel-header"]') as HTMLElement;
            const titleBar = element.querySelector('[class*="panel-title"]')?.parentElement as HTMLElement;
            const titleText = element.querySelector('[class*="panel-title"]') as HTMLElement;

            if (header) {
              header.style.background = background;
              header.style.borderBottom = 'none';
            }

            if (titleBar && titleBar !== header) {
              titleBar.style.background = background;
            }

            if (titleText && customTitleColor) {
              titleText.style.color = customTitleColor;
            }

            // Find panel-content
            const panelContent = element.querySelector('[class*="panel-content"]') as HTMLElement;
            if (panelContent) {
              panelContent.style.background = background;
            }

            // If we found any of these, we're done
            if (header || titleBar || panelContent) {
              break;
            }
          }
        }
      }
    }, [customGradient, customBackground, customTitleColor, renderCounter]);

    const wrapperStyle = (customGradient || customBackground)
      ? css({
          background: customGradient || customBackground,
          height: '100%',
          width: '100%',
          position: 'relative',
        })
      : undefined;

    const content = (
      <VizRepeater
        getValues={getValues}
        getAlignmentFactors={getDisplayValueAlignmentFactors}
        renderValue={renderValue}
        width={width}
        height={height}
        source={data}
        itemSpacing={3}
        renderCounter={renderCounter}
        autoGrid={true}
        orientation={options.orientation}
      />
    );

    if (wrapperStyle || customBottomText) {
      return (
        <div ref={wrapperRef} className={wrapperStyle} style={{ height: '100%', width: '100%', position: 'relative' }}>
          {content}
          {customBottomText && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: customBottomTextColor || 'white',
                fontSize: '18px',
                fontWeight: 600,
                opacity: 1,
              }}
            >
              {customBottomText}
            </div>
          )}
        </div>
      );
    }

    return <div ref={wrapperRef}>{content}</div>;
  }
);
StatPanel.displayName = 'StatPanel';
