import dynamic from "next/dynamic";

const Dropdown = dynamic(
  () => import("monday-ui-react-core").then((mod) => mod.Dropdown),
  {
    ssr: false,
  }
);

type DropdownSelection = {
  id: number;
  value: string;
}

type Props = {
  className?: string;
  workspaces: Record<string, any>[];
  onChange: (e:DropdownSelection) => void;
  value: Record<string, any>
  placeholder?: string;
};

const SelectWorkspace = ({className, workspaces, value, onChange, placeholder}:Props): JSX.Element => {
  return (
    <Dropdown
    className={className}
    options={workspaces}
    onChange={onChange}
    value={value}
    size="small"
    />
  );
};

export default SelectWorkspace;