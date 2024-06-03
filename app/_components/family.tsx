import {useContext} from "react";
import {familyContext} from "@/app/privoders/family";
import {LifeEventComponent} from "@/app/_components/life-event";
import {Adult} from "@/app/lib/type";

export const FamilyComponent = () => {
  const {family} = useContext(familyContext);
  return (
    <>
      {family.user && <AdultComponent adult={family.user} />}
    </>
  )
}

type Props = {
  adult: Adult;
}

const AdultComponent =  ({adult}: Props) => {
  return (
    <>
      {
        adult.lifeEvents.map((le, i) => {
          return <LifeEventComponent key={i} event={le}/>
        })
      }
    </>
  )
}