export interface Options {
  gradientStart: string;
  gradientEnd: string;
  title: string;
  showValue: boolean;
  valueFontSize: number;
  showPercentChange: boolean;
  percentChangeColor: string;
}

export const defaultOptions: Options = {
  gradientStart: '#422980',
  gradientEnd: '#3A34A3',
  title: 'Total revenue',
  showValue: true,
  valueFontSize: 48,
  showPercentChange: true,
  percentChangeColor: '#FF5286',
};
