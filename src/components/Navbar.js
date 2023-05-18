import React, { useContext, useState, useEffect } from "react";
import images from "../images/index";
import { BsCaretUp, BsCaretDown } from "react-icons/bs";
import { ApplicationContext } from "../context/ApplicationContext";
import list from "../utils/list.json";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [options, setOption] = useState("Select network");
  const { currentAccount, connectWallet, changeNetwork, getCurrentChainId } =
    useContext(ApplicationContext);

  const getChainName = () => {
    const id = getCurrentChainId();
    console.log("Id is: ", id);
    list.forEach((item, i) => {
      if (item.ChainId === id) setOption(item.name);
    });
  };

  useEffect(() => {
    getChainName();
  }, [getChainName]);

  const truncateHex = (hex) => {
    const prefix = hex.slice(0, 2);
    const body = hex.slice(2, 4);
    const suffix = hex.slice(-3);

    return `${prefix}${body}...${suffix}`;
  };

  const changeChain = async (_chainName, _chainID) => {
    await changeNetwork(parseInt(_chainID));
    getChainName();
  };

  return (
    <nav className="fixed w-full bg-mygreen top-0 z-40 backdrop-filter backdrop-blur-lg bg-opacity-30 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-3">
        <div className="flex items-center justify-between h-16">
          <img
            src={images.logo}
            className="w-[50px] text-2xl select-none text-gray-900 font-semibold cursor-pointer "
          />
          <div className="flex space-x-1 text-slate-300 font-semibold">
            <div
              className="flex flex-row cursor-pointer select-none space-x-2 rounded-md w-fit h-fit p-2 m-4 bg-cyan-700/30"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <div>{options}</div>
              {isOpen ? (
                <BsCaretUp className="mt-1" />
              ) : (
                <BsCaretDown className="mt-1.5" />
              )}
              {!isOpen && (
                <div className="p-1 flex flex-col w-[200px] fixed top-full left-auto bg-white/50 paper dark:bg-slate-800/50">
                  {list.map((item, i) => (
                    <div
                      className="flex justify-between items-center hover:bg-slate-500/50 cursor-pointer rounded-lg m-1 p-1"
                      key={i}
                      onClick={() => changeChain(item.name, item.ChainId)}
                    >
                      <h3>{item.name}</h3>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div
              className=" flex flex-row cursor-pointer select-none rounded-md w-fit h-fit p-2 m-4 bg-cyan-700/30"
              onClick={connectWallet}
            >
              <div>
                {currentAccount !== "" ? (
                  <>{truncateHex(currentAccount)}</>
                ) : (
                  <>Connect Wallet</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
