import Spinner from "./Spinner";

const Loading = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <Spinner className="w-[30%] h-[30%]" />
  </div>
);

export default Loading;
