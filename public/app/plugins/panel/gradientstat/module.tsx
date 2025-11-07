import { PanelPlugin } from '@grafana/data';

import { GradientStatPanel } from './GradientStatPanel';
import { Options, defaultOptions } from './types';

export const plugin = new PanelPlugin<Options>(GradientStatPanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'title',
      name: 'Title',
      description: 'The title text displayed above the value',
      defaultValue: defaultOptions.title,
    })
    .addBooleanSwitch({
      path: 'showValue',
      name: 'Show real value',
      description: 'Toggle between real data value and static $12.6k',
      defaultValue: defaultOptions.showValue,
    })
    .addNumberInput({
      path: 'valueFontSize',
      name: 'Value font size',
      description: 'Font size for the main value',
      defaultValue: defaultOptions.valueFontSize,
      settings: {
        min: 12,
        max: 120,
      },
    })
    .addColorPicker({
      path: 'gradientStart',
      name: 'Gradient start color',
      description: 'Left side of the gradient background',
      defaultValue: defaultOptions.gradientStart,
    })
    .addColorPicker({
      path: 'gradientEnd',
      name: 'Gradient end color',
      description: 'Right side of the gradient background',
      defaultValue: defaultOptions.gradientEnd,
    })
    .addBooleanSwitch({
      path: 'showPercentChange',
      name: 'Show percent change',
      description: 'Display percentage change indicator with arrow',
      defaultValue: defaultOptions.showPercentChange,
    })
    .addColorPicker({
      path: 'percentChangeColor',
      name: 'Percent change color',
      description: 'Color for the percentage change text and arrow',
      defaultValue: defaultOptions.percentChangeColor,
    });
});
