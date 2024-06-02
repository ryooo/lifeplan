import Image from "next/image";
import {Timeline} from "@/app/_components/timeline";
import {LifeEventRow} from "@/app/_components/life-event";

export default function Home() {
  return (
    <main className="h-screen flex flex-wrap flex-col p-12">
      <div className="h-2/3">
        <div className="grid grid-cols-10">
          <LifeEventRow />
        </div>
      </div>
      <div className="h-1/3 pl-20">
        <Timeline />
      </div>
    </main>
  );
}
