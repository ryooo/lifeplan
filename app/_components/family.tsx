import {useContext, useState} from "react";
import {familyContext} from "@/app/privoders/family";
import {LifeEventComponent} from "@/app/_components/life-event";
import {Adult, Person} from "@/app/lib/type";
import {AssetsComponent} from "@/app/_components/assets";

export const FamilyComponent = () => {
  const {family} = useContext(familyContext);
  return (
    <>
      {family.user && <PersonComponent key={family.user.id} person={family.user} />}
      {family.partner && <PersonComponent key={family.partner.id} person={family.partner} />}
    </>
  )
}

type Props = {
  person: Person;
}

const PersonComponent =  ({person}: Props) => {
  const [opened, setOpened] = useState(false)
  return (
    <div id="accordion-open" data-accordion="open">
      <h2 id="accordion-open-heading-1">
        <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3" data-accordion-target="#accordion-open-body-1" onClick={(e) => {setOpened(!opened)}}>
          <span className="flex items-center"><svg className="w-5 h-5 me-2 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>{person.id}</span>
          <svg data-accordion-icon className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
          </svg>
        </button>
      </h2>
      <div id="accordion-open-body-1" className={opened ? "" : "hidden"}>
        <div className="p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          {
            person.lifeEvents.map((event, i) => {
              return <LifeEventComponent key={i} eventIndex={i} personId={person.id}/>
            })
          }
          {
            person.assets.map((asset, i) => {
              return <AssetsComponent key={i} personId={person.id}/>
            })
          }
        </div>
      </div>
    </div>
  )
}