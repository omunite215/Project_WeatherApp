import { Skeleton } from "@/components/ui/skeleton";

const loading = () => {
  const repeatitions = [1, 2, 3, 4, 5, 6];
  return (
    <div>
      <Skeleton className="w-screen h-6" />
      <Skeleton className="h-[50vh] w-screen" />
      <section className="flexBetween lg:flex-row flex-col py-4 padding-x gap-y-6">
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
          {repeatitions.map((item) => (
            <Skeleton className="w-6 h-6" key={item} />
          ))}
        </div>
        <Skeleton className="h-72 2xl:w-[40rem] xl:w-[35rem] lg:w-[25rem] md:w-[20rem] rounded-md" />
      </section>
    </div>
  );
};

export default loading;
