import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

type Props = {
  automaticCount: number;
  manualCount: number;
};

export function PaymentSuccessCircle({
  automaticCount,
  manualCount,
}: Props) {
  const total = automaticCount + manualCount;

  const automaticPercentage = total === 0 ? 0 : (automaticCount / total) * 100;

  const manualPercentage = total === 0 ? 0 : (manualCount / total) * 100;

  const size = 380;
  const center = size / 2;
  const outerRadius = 130;
  const innerRadius = 75;
  const strokeWidth = 75;

  const circumference = 2 * Math.PI * outerRadius;

  const automaticLength = circumference * (automaticPercentage / 100);

  const manualLength = circumference * (manualPercentage / 100);

  const lineCount = 50;

  const lines = Array.from(
    { length: lineCount },
    (_, index) => {
      const angle = (index * 360) / lineCount;

      const radians = (angle * Math.PI) / 180;

      const x2 = center + outerRadius * Math.cos(radians);

      const y2 = center + outerRadius * Math.sin(radians);

      return (
        <Line key={index} x1={center} y1={center} x2={x2} y2={y2} stroke="#d1d5db" strokeWidth="1" />
      );
    }
  );

  return (
    <>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />

        {automaticPercentage > 0 && (
          <Circle
            cx={center} cy={center} r={outerRadius} fill="none" stroke="#45df7d"
            strokeWidth={strokeWidth} strokeDasharray={[automaticLength,circumference]}
            strokeLinecap="butt" transform={`rotate(-90 ${center} ${center})`}
          />
        )}

        {manualPercentage > 0 && (
          <Circle
            cx={center} cy={center} r={outerRadius} fill="none" stroke="#db5656"
            strokeWidth={strokeWidth}
            strokeDasharray={[ manualLength, circumference ]}
            strokeDashoffset={-automaticLength}
            strokeLinecap="butt" transform={`rotate(-90 ${center} ${center})`}
          />
        )}

        <Circle cx={center} cy={center} r={innerRadius} fill="#e4f2e3" />

        {lines}

        <SvgText x={center} y={center - 5} fontSize="36" fontWeight="800" fill="#16a34a" textAnchor="middle">
          {automaticPercentage.toFixed(0)}%
        </SvgText>

        <SvgText x={center} y={center + 17} fontSize="15" fontWeight="700" fill="#5577bf" textAnchor="middle">
          SUCCESS RATE
        </SvgText>
      </Svg>

    </>
  );
}