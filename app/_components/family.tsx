import {useContext, useState} from "react";
import {familyContext} from "@/app/privoders/family";
import {LifeEventComponent} from "@/app/_components/life-event";
import {Adult, Family, Person} from "@/app/lib/type";
import {AssetComponent} from "@/app/_components/assets";
import {last} from "@/app/lib/helper";

export const FamilyComponent = () => {
  const {family} = useContext(familyContext);
  const familyIds = getFamilyIds(family)
  return (
    <>
      {family.user && <PersonComponent key={family.user.id} person={family.user} familyIds={familyIds} />}
      {family.partner && <PersonComponent key={family.partner.id} person={family.partner} familyIds={familyIds} />}
      {family.children.map(c => <PersonComponent key={c.id} person={c} familyIds={familyIds} />)}
    </>
  )
}

type Props = {
  person: Person;
  familyIds: string[];
}

const PersonComponent = ({person, familyIds}: Props) => {
  const [opened, setOpened] = useState(false)
  const isFirst = familyIds.indexOf(person.id) === 0
  const isLast = familyIds.indexOf(person.id) === 3
  return (
    <div>
      <h2>
        <button type="button"
                className={(isFirst ? "rounded-t-xl " : "") + (isLast && !opened ? "rounded-b-xl " : "") + "flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"}
                data-accordion-target="#accordion-open-body-1" onClick={(e) => {
          setOpened(!opened)
        }}>
          <span className="flex items-center"><svg className="w-5 h-5 me-2 shrink-0" fill="currentColor"
                                                   viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"></path></svg>
            {person.id}</span>
          <svg className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true"
               xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 5 5 1 1 5"/>
          </svg>
        </button>
      </h2>
      <div className={opened ? "" : "hidden"}>
        <div className={(isLast ? "rounded-b-xl " : "") + "p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900"}>
          {
            person.lifeEvents.map((event, i) => {
              return <LifeEventComponent key={i} eventIndex={i} personId={person.id}/>
            })
          }
          {
            person.assets.map((asset, i) => {
              return <AssetComponent key={i} personId={person.id} assetIndex={i} />
            })
          }
        </div>
      </div>
    </div>
  )
}

const getFamilyIds = (family: Family): string[] => {
  const ids = [family.user, family.partner, ...family.children]
    .map(p => p?.id)
    .filter((e): e is string => Boolean(e)) // compact
  return ids
};
