import FormField, { FormIconField } from "../components/FormField";
import UserToggle, { ModeratorToggle } from "../components/RoleStatus";
import { useState } from "react";
import SellerStat, { CustomerStat } from "../components/SellerStat";



import type { SettingBlocProps } from "../interfaces/profileInfos"; // added by srandria

const SettingBloc: React.FC<SettingBlocProps> = ({ type, value, first }) => {
    return (
        <div className="flex flex-col">
            <FormIconField type={type} value={value} />
            <div className="flex flex-row w-full h-full items-center space-x-3">
                <input type="text" className="bg-white text-black h-8 rounded-lg pl-3"
                    defaultValue={first} />
                <button className="font-icon  text-3xl"></button>
            </div>
        </div>
    );
}

const UserProfile: React.FC = () => {
    const [role, setRole] = useState("Customer");
    const [setting, setSetting] = useState("off");
    return (
        <div className="flex flex-row w-screen h-2/3 space-x-5 justify-center items-center">
            <div className="flex flex-col w-1/2 h-full text-gray-300 
                rounded-lg p-10 space-y-10 border border-white m-20">
                <div className="relative flex w-full h-full">
                    {setting === "off" ?
                        <div className="flex flex-col justify-center items-center flex-1">
                            <div className="flex flex-col items-center space-y-5">
                                <FormIconField type="" value="USER" />
                                <div>
                                    <FormIconField type="" value="Jules Mureau" />
                                    <FormIconField type="󰇮" value="Jules@gmail.com" />
                                    <FormIconField type="" value="+261344512512" />
                                    <FormIconField type="󰻗" value="10/11/2025" />
                                </div>
                            </div>
                        </div>
                        :
                        <div className="flex flex-col w-full justify-center items-center flex-1">
                            <div className="flex flex-col w-full space-y-3 items-center">
                                <FormIconField type="" value="USER" />
                                <SettingBloc type="" value="Name" first="Jules Mureau" />
                                <SettingBloc type="󰇮" value="Adress email" first="Jules@gmail.com" />
                                <SettingBloc type="" value="Phone number" first="+261344512512" />
                            </div>
                        </div>
                    }
                    {setting === "off" ?
                        <button className="flex justify-end font-icon text-yellow-300 text-4xl" onClick={() => setSetting(setting === "off" ? "on" : "off")}></button> :
                        <button className="flex justify-end text-yellow-300 font-icon text-4xl" onClick={() => setSetting(setting === "off" ? "on" : "off")}></button>
                    }
                </div>
            </div>

            <div className="text-white w-1/2 h-full rounded-lg m-20 border border-white">
                <div className="flex justify-center h-1/7 font-serif">
                    <UserToggle role={role} setRole={setRole} />
                </div>
                {role === "Customer" &&
                    <div className="h-6/7">
                        <CustomerStat />
                    </div>
                }
                {role === "Seller" &&
                    <div className="h-6/7">
                        <SellerStat />
                    </div>
                }
            </div>
        </div>
    );
}


const ModeratorProfile: React.FC = () => {
    const [role, setRole] = useState("Customer");
    const [setting, setSetting] = useState("off");
    return (
        <div className="flex flex-row w-screen h-2/3 space-x-5 justify-center items-center">
            <div className="flex flex-col w-1/2 h-full text-gray-300 
                rounded-lg p-10 space-y-10 border border-white m-20">
                <div className="relative flex w-full h-full">
                    {setting === "off" ?
                        <div className="flex flex-col justify-center items-center flex-1">
                            <div className="flex flex-col items-center space-y-5">
                                <FormIconField type="" value="MODERATOR" />
                                <div className="flex flex-col">
                                    <FormIconField type="" value="Romeo Elias" />
                                    <FormIconField type="󰇮" value="Rom@gmail.com" />
                                    <FormIconField type="" value="+261244542517" />
                                    <FormIconField type="󰻗" value="10/11/2004" />
                                </div>
                            </div>
                        </div>
                        :
                        <div className="flex flex-col w-full justify-center items-center flex-1">
                            <div className="flex flex-col w-full space-y-5 items-center">
                                <FormIconField type="" value="USER" />
                                <SettingBloc type="" value="Name" first="Romeo Elias" />
                                <SettingBloc type="󰇮" value="Adress email" first="Rom@gmail.com" />
                                <SettingBloc type="" value="Phone number" first="+261244542517" />
                            </div>
                        </div>
                    }
                    {setting === "off" ?
                        <button className="flex justify-end font-icon text-yellow-300 text-4xl" onClick={() => setSetting(setting === "off" ? "on" : "off")}></button> :
                        <button className="flex justify-end text-yellow-300 font-icon text-4xl" onClick={() => setSetting(setting === "off" ? "on" : "off")}></button>
                    }
                </div>
            </div>
        </div>
    );
}

const Profile: React.FC = () => {
    return (
        <div className="flex flex-col w-screen h-screen justify-center items-start"
        >
            <UserProfile />
        </div>
    );
}

export default Profile;
