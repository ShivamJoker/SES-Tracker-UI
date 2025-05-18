import { Component, JSX, Show, splitProps } from "solid-js";

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  placeholder: string;
  rightLabel?: string;
  rightLink?: string;
  bottomText?: string;
}

const Input: Component<InputProps> = (props) => {
  const [common, rest] = splitProps(props, [
    "label",
    "name",
    "bottomText",
    "rightLink",
    "rightLabel",
  ]);

  const id = common.name.toLowerCase().replaceAll(" ", "-");
  return (
    <div class="flex flex-col gap-2">
      <div class="flex justify-between">
        <label for={id} class="">
          {common.label}
        </label>
        <Show when={common.rightLabel}>
          <a href={common.rightLink} class="">
            {common.rightLabel}
          </a>
        </Show>
      </div>
      <input id={id} name={common.name} {...rest} />
      <Show when={common.bottomText}>
        <p class="">{common.bottomText}</p>
      </Show>
    </div>
  );
};

export default Input;
