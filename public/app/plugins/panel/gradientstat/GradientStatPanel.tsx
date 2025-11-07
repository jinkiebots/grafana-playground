import { css } from '@emotion/css';
import { memo } from 'react';

import { getFieldDisplayValues, PanelProps, reduceField, ReducerID } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';

import { Options } from './types';

export const GradientStatPanel = memo(({ options, data, width, height }: PanelProps<Options>) => {
  const theme = useTheme2();

  // Get the field values from the data
  const fieldDisplay = getFieldDisplayValues({
    fieldConfig: {
      defaults: {},
      overrides: [],
    },
    reduceOptions: {
      calcs: [ReducerID.lastNotNull],
    },
    data: data.series,
    theme,
  });

  // Get the main value
  const mainValue = fieldDisplay[0]?.display?.text || '$0';

  // Calculate percentage change if we have more than one value
  let percentChange = 0;
  let isDecrease = false;

  if (data.series[0]?.fields[1]?.values.length >= 2) {
    const values = data.series[0].fields[1].values.toArray();
    const current = values[values.length - 1];
    const previous = values[values.length - 2];

    if (previous && previous !== 0) {
      percentChange = Math.abs(((current - previous) / previous) * 100);
      isDecrease = current < previous;
    }
  }

  const styles = {
    container: css({
      background: `linear-gradient(to right, ${options.gradientStart}, ${options.gradientEnd})`,
      padding: '30px',
      borderRadius: theme.shape.radius.default,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontFamily: theme.typography.fontFamily,
    }),
    title: css({
      fontSize: '14px',
      fontWeight: 500,
      marginBottom: '10px',
      opacity: 0.9,
    }),
    value: css({
      fontSize: options.valueFontSize || 48,
      fontWeight: 700,
      marginBottom: '15px',
    }),
    percentChange: css({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: options.percentChangeColor,
      fontSize: '16px',
      fontWeight: 600,
    }),
    arrow: css({
      fontSize: '20px',
    }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>{options.title || 'Total revenue'}</div>
      <div className={styles.value}>{options.showValue ? mainValue : '$12.6k'}</div>
      {options.showPercentChange && (
        <div className={styles.percentChange}>
          <span className={styles.arrow}>{isDecrease ? '↓' : '↑'}</span>
          <span>{percentChange.toFixed(3)}%</span>
        </div>
      )}
    </div>
  );
});

GradientStatPanel.displayName = 'GradientStatPanel';
