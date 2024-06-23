import {Dispatch, SetStateAction, useCallback, useContext, useState} from "react";
import {familyContext} from "@/app/privoders/family";
import {LifeEventComponent} from "@/app/_components/life-event";
import {Adult, Child, Family, Person} from "@/app/lib/type";
import {AssetComponent} from "@/app/_components/assets";
import {
  AdultParams,
  AssetParams,
  ChildParams,
  createAdult,
  createChild,
  isAdult,
  isMan,
  isWoman
} from "@/app/lib/query";
import StreamlineEmojisManOfficeWorker2 from "@/app/icons/StreamlineEmojisManOfficeWorker2";
import FluentEmojiFlatWhiteQuestionMark from "@/app/icons/FluentEmojiFlatWhiteQuestionMark";
import StreamlineEmojisBoy2 from "@/app/icons/StreamlineEmojisBoy2";
import StreamlineEmojisGirl2 from "@/app/icons/StreamlineEmojisGirl2";
import StreamlineEmojisWomanOfficeWorker2 from "@/app/icons/StreamlineEmojisWomanOfficeWorker2";
import {Slider} from "@nextui-org/slider";
import {Button} from "@nextui-org/react";
import {PersonParamsComponent, SliderPopup, SliderPopupProps} from "@/app/_components/params";
import Link from "next/link";

export const FamilyComponent = () => {
  const [sliderPopupProp, setSliderPopupProp] = useState<SliderPopupProps | undefined>()
  const {family} = useContext(familyContext);
  return (
    <>
      {family.adults.map(c => <PersonComponent key={c.id} person={c} setSliderPopupProp={setSliderPopupProp}/>)}
      {family.children.map(c => <PersonComponent key={c.id} person={c} setSliderPopupProp={setSliderPopupProp}/>)}
      <div>
        {
          (family.assets || []).map((asset, i) => {
            return <AssetComponent key={i} assetIndex={i} asset={family.assets[i]}/>
          })
        }
      </div>
      {sliderPopupProp && <SliderPopup {...sliderPopupProp} />}
    </>
  )
}

type Props = {
  person: Person;
  setSliderPopupProp: Dispatch<SetStateAction<SliderPopupProps | undefined>>;
}

const PersonComponent = ({person, setSliderPopupProp}: Props) => {
  const [opened, setOpened] = useState(person.opened)

  const {family, setFamily} = useContext(familyContext);

  const updateParams = useCallback((params: AdultParams | ChildParams | AssetParams) => {
    const newFamily = {...family}
    const adultIndex = newFamily.adults.findIndex(a => a.id === person.id)
    params.opened = opened
    if (adultIndex >= 0) {
      newFamily.adults[adultIndex] = createAdult(params as AdultParams)
    } else {
      const childIndex = newFamily.children.findIndex(a => a.id === person.id)
      if (childIndex >= 0) {
        newFamily.children[childIndex] = createChild(params as ChildParams)
      }
    }

    setFamily(newFamily)
  }, [family, person, opened])

  const removeMe = useCallback(() => {
    const newFamily = {...family}
    newFamily.adults = newFamily.adults.filter(a => a.id !== person.id);
    newFamily.children = newFamily.children.filter(a => a.id !== person.id);
    setFamily(newFamily)
  }, [family, person, opened])

  return (
    <div className="my-3">
      <h2>
        <button
          type="button"
                className="rounded-t-xl flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                data-accordion-target="#accordion-open-body-1" onClick={(e) => {
          setOpened(!opened)
        }}>
          <span className="flex items-center text-2xl">
            {getIcon(person)}{person.name}
            <Link className={'ml-4'} href={'#'} role={'button'} onClick={() => removeMe()}>削除</Link>
          </span>
          <svg className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true"
               xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
          </svg>
        </button>
        <div
          className={(opened ? "" : "rounded-b-xl ") + "p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900"}>
          <PersonParamsComponent person={person} updateParams={updateParams} setSliderPopupProp={setSliderPopupProp}/>
        </div>
      </h2>
      <div className={opened ? "" : "hidden"}>
        <div
          className={"rounded-b-xl p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900"}>
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

export const getIcon = (person: Person) => {
  if (isMan(person)) {
    if (isAdult(person)) {
      return <StreamlineEmojisManOfficeWorker2 fontSize={80}/>
    }
    return <StreamlineEmojisBoy2 fontSize={80}/>
  } else if (isWoman(person)) {
    if (isAdult(person)) {
      return <StreamlineEmojisWomanOfficeWorker2 fontSize={80}/>
    }
    return <StreamlineEmojisGirl2 fontSize={80}/>
  }
  return <FluentEmojiFlatWhiteQuestionMark fontSize={80}/>
}

export const getAllMembers = (family: Family): Person[] => {
  const members: Person[] = []
  members.push(...family.adults)
  members.push(...family.children)
  return members
}
