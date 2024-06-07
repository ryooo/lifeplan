import {useCallback, useContext, useEffect, useState} from "react";
import {familyContext} from "@/app/privoders/family";
import {LifeEventComponent} from "@/app/_components/life-event";
import {Adult, Child, Family, getPerson, Person} from "@/app/lib/type";
import {AssetComponent} from "@/app/_components/assets";
import {AdultParams, ChildParams, createAdult, createChild} from "@/app/lib/query";

export const FamilyComponent = () => {
  const {family} = useContext(familyContext);
  const familyIds = getFamilyIds(family)
  return (
    <>
      {family.user && <PersonComponent key={family.user.id} person={family.user} familyIds={familyIds}/>}
      {family.partner && <PersonComponent key={family.partner.id} person={family.partner} familyIds={familyIds}/>}
      {family.children.map(c => <PersonComponent key={c.id} person={c} familyIds={familyIds}/>)}
      <div>
        {
          (family.assets || []).map((asset, i) => {
            return <AssetComponent key={i} assetIndex={i} asset={family.assets[i]}/>
          })
        }
      </div>
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

  const {family, setFamily} = useContext(familyContext);

  const updateParams = useCallback((params: AdultParams | ChildParams) => {
    const newFamily = {...family}
    switch (person.id) {
      case "user":
        newFamily.user = createAdult(params as AdultParams)
        break;
      case "partner":
        newFamily.partner = createAdult(params as AdultParams)
        break;
      default:
        const i = Number(person.id.replace("child", "")) - 1
        newFamily.children[i] = createChild(params as ChildParams)
        break;
    }
    setFamily(newFamily)
  }, [family, person])

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
        <div className="p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          <ParamsComponent person={person} updateParams={updateParams} />
        </div>
      </h2>
      <div className={opened ? "" : "hidden"}>
        <div
          className={(isLast ? "rounded-b-xl " : "") + "p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900"}>
          {
            person.lifeEvents.map((event, i) => {
              return <LifeEventComponent key={i} eventIndex={i} personId={person.id}/>
            })
          }
        </div>
      </div>
    </div>
  )
}

const getFamilyIds = (family: Family): string[] => {
  return getAllMembers(family).map(p => p?.id)
};

export const getAllMembers = (family: Family): Person[] => {
  const members: Person[] = []
  if (family.user) members.push(family.user)
  if (family.partner) members.push(family.partner)
  members.push(...family.children)
  return members
}

const ParamsComponent = (props: { person: Person, updateParams: (params: (AdultParams | ChildParams)) => void }) => {
  switch (props.person.id) {
    case "user":
      return <AdultParamsComponent person={props.person as Adult} updateParams={props.updateParams} />;
    case "partner":
      return <AdultParamsComponent person={props.person as Adult} updateParams={props.updateParams} />;
  }
  return <ChildParamsComponent person={props.person as Child} updateParams={props.updateParams} />;
}

const AdultParamsComponent = (props: { person: Adult, updateParams: (params: (AdultParams | ChildParams)) => void }) => {
  const [age, setAge] = useState(props.person.params.age.toString());
  const [peekAge, setPeekAge] = useState(props.person.params.peekAge.toString());
  const [toPeekRate, setToPeekRate] = useState(props.person.params.toPeekRate.toString());
  const [retireAge, setRetireAge] = useState(props.person.params.retireAge.toString());
  const [toRetireRate, setToRetireRate] = useState(props.person.params.toRetireRate.toString());
  const [currentIncome, setCurrentIncome] = useState(props.person.params.currentIncome.toString());
  const [pension, setPension] = useState(props.person.params.pension.toString());
  const [baseExpence, setBaseExpence] = useState(props.person.params.baseExpence.toString());

  return (
    <>
      年齢：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={age} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && e.target.value.indexOf('.') < 0) {
          props.updateParams({ ...props.person.params, age: value })
          setAge(e.target.value)
        }
      }}/>歳、
      年収ピーク年齢：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={peekAge} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && e.target.value.indexOf('.') < 0) {
          props.updateParams({ ...props.person.params, peekAge: value })
          setPeekAge(e.target.value)
        }
      }}/>歳、
      年収上昇率：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={toPeekRate} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value)) {
          props.updateParams({ ...props.person.params, toPeekRate: value })
          setToPeekRate(e.target.value)
        }
      }}/>倍、
      定年：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={retireAge} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && e.target.value.indexOf('.') < 0) {
          props.updateParams({ ...props.person.params, retireAge: value })
          setRetireAge(e.target.value)
        }
      }}/>歳、
      年収下降率：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={toRetireRate} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value)) {
          props.updateParams({ ...props.person.params, toRetireRate: value })
          setToRetireRate(e.target.value)
        }
      }}/>倍、
      年収：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={currentIncome} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && e.target.value.indexOf('.') < 0) {
          props.updateParams({ ...props.person.params, currentIncome: value })
          setCurrentIncome(e.target.value)
        }
      }}/>万円/年、
      年金：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={pension} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && e.target.value.indexOf('.') < 0) {
          props.updateParams({ ...props.person.params, pension: value })
          setPension(e.target.value)
        }
      }}/>万円/年、
      生活費：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={baseExpence} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && e.target.value.indexOf('.') < 0) {
          props.updateParams({ ...props.person.params, baseExpence: value })
          setBaseExpence(e.target.value)
        }
      }}/>万円/年
    </>
  )
}

const ChildParamsComponent = (props: { person: Child, updateParams: (params: (AdultParams | ChildParams)) => void }) => {
  const [age, setAge] = useState(props.person.params.age.toString());
  const [baseExpence, setBaseExpence] = useState(props.person.params.baseExpence.toString());
  const [highSchoolExpence, setHighSchoolExpence] = useState(props.person.params.highSchoolExpence.toString());
  const [universityExpence, setUniversityExpence] = useState(props.person.params.universityExpence.toString());

  return (
    <>
      年齢：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={age} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && e.target.value.indexOf('.') < 0) {
          props.updateParams({ ...props.person.params, age: value })
          setAge(e.target.value)
        }
      }}/>歳、
      高校学費：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={highSchoolExpence} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && e.target.value.indexOf('.') < 0) {
          props.updateParams({ ...props.person.params, highSchoolExpence: value })
          setHighSchoolExpence(e.target.value)
        }
      }}/>万円/年、
      大学学費：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={universityExpence} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && e.target.value.indexOf('.') < 0) {
          props.updateParams({ ...props.person.params, universityExpence: value })
          setUniversityExpence(e.target.value)
        }
      }}/>万円/年
      生活費：
      <input type="text" className="w-12 border-2 rounded-lg text-center mr-1" value={baseExpence} onChange={(e) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && e.target.value.indexOf('.') < 0) {
          props.updateParams({ ...props.person.params, baseExpence: value })
          setBaseExpence(e.target.value)
        }
      }}/>万円/年
    </>
  )
}