import Spinner from './Spinner';

const Loading = () => (
  <div className="absolute flex h-full w-full items-center justify-center">
    <Spinner className="h-[30%] w-[30%]" />
  </div>
);

export default Loading;
