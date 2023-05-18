import React, { useState } from "react";
import { BsCaretUp, BsCaretDown } from "react-icons/bs";
import { IoIosWallet } from "react-icons/io";
import list from "../utils/tokenlist.json";

const Landing = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [options, setOptions] = useState(list[0].name);

  return (
    <div className="p-4 mx-auto mt-16 mb-[86px] flex flex-col h-screen gap-4 w-full items-center justify-center">
      <div className="flex flex-col rounded-xl w-fit p-8 mb-1 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50 hover:from-indigo-500/60 hover:via-purple-500/60 hover:to-pink-500/60 saturate-[2]">
        <div className="flex flex-row w-full h-fit">
          <input
            type="number"
            min={0}
            placeholder={0}
            className="appearance-none::-webkit-inner-spin-button border-none bg-transparent placeholder:text-xl font-bold text-white text-xl p-2 m-1 rounded-md focus:outline-none focus:ring-0"
          ></input>
          <div
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex flex-row font-bold text-white select-none text-xl p-2 m-1 rounded-md bg-gradient-to-r from-indigo-500/20 to-purple-500/20 saturate-[2]"
          >
            {options}
            {isOpen ? (
              <BsCaretUp className="mt-0.5 ms-3" />
            ) : (
              <BsCaretDown className="mt-1 ms-3" />
            )}
            {!isOpen && (
              <div className="p-1 flex flex-col w-[200px] fixed left-0 rounded-md mt-2 select-none top-full bg-white/90 paper dark:bg-slate-800">
                {list.map((item, i) => (
                  <div
                    className="flex flex-row justify-between items-center hover:bg-slate-500/50 cursor-pointer rounded-lg m-1 p-1"
                    key={i}
                    onClick={() => setOptions(item.name)}
                  >
                    <h3>{item.name}</h3>
                    <h3>{item.Symbol}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-row w-full h-fit justify-between -mx-2.5 mt-3">
          <div></div>
          <div className="flex flex-row ml-3 text-gray-400/70 text-lg font-bold">
            <IoIosWallet className="mt-0.5 mr-3 text-2xl" />
            <div>0.00</div>
          </div>
        </div>
      </div>
      <div className="flex w-fit h-fit rounded-lg py-2 px-52 bg-blue-500/60 hover:bg-blue-500/70 hover:text-white cursor-pointer text-slate-300 text-xl font-bold">
        Swap
      </div>
    </div>
  );
};

export default Landing;
