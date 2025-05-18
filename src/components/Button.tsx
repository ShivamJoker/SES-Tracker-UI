import { Component, JSX, Show, splitProps } from "solid-js";

interface InputProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  isLoading?: boolean;
}

const Input: Component<InputProps> = (props) => {
  const [common, rest] = splitProps(props, ["title", "isLoading"]);

  return (
    <button
      aria-busy={common.isLoading}
      class="flex flex-col items-center"
      disabled={common.isLoading}
      {...rest}
    >
      <Show when={common.isLoading}>
        <img class="m-0 filter-invert" height="22px" src="/icons/loading.svg" />
      </Show>

      <Show when={!common.isLoading}>{common.title}</Show>
    </button>
  );
};

export default Input;
