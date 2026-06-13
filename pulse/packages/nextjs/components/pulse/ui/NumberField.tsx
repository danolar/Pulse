type NumberFieldProps = {
  label: string;
  unit: string;
  value: number;
  disabled?: boolean;
  min?: number;
  hint?: string;
  onChange: (value: number) => void;
};

export const NumberField = ({
  label,
  unit,
  value,
  disabled,
  min = 1,
  hint,
  onChange,
}: NumberFieldProps) => (
  <label className="form-control">
    <span className="label-text mb-1 text-sm text-pulse-muted">
      {label} ({unit})
    </span>
    <input
      type="number"
      min={min}
      className="input input-bordered rounded-2xl"
      value={value}
      disabled={disabled}
      onChange={event => onChange(Number(event.target.value) || 0)}
    />
    {hint ? <span className="mt-1 text-xs text-pulse-muted">{hint}</span> : null}
  </label>
);
