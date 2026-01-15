import React, { useState } from "react";
import BoxSection from "../components/BoxSection";
import { useTranslation } from "react-i18next";
import SettingPop from "../components/SettingPop";

interface StatProps {
	type: string;
	value: string;
	info: boolean;
}

const SettingBloc = ({type, value}) => {
	return (
		<div className="w-full flex flex-col text-background text-inter">
			<p className="text-background underline ">{type} :</p>
			<div className="flow flow-row w-full space-x-2 font-icon items-center">
				<input type="text" className="w-[80%] bg-darktone border border-background
				rounded-lg text-black" />
				<button className="text-xl text-accent"></button>
			</div>
		</div>
	);
}

const StatValue = ({type, value}) => {
	return (
		<div className="flex flex-col items-center w-[30%]">
			
			<div className=" text-accent font-bold font-higuen">{value}</div>
			<div className="font-light font-geist">{type}</div>
		</div>
	);
}

const Setting = ({icon, type}) => {
	return (
		<div className="flex flex-row space-x-5 justify-center items-center text-background">
			<div className="font-icon text-xl">{icon}</div>
			<div className="font-inter">{type}</div>
		</div>
	);
}

const Logout = ({icon,type}) => {
	return (
		<div>
			<div className="font-inter">{type}</div>
			<div className="font-icon text-xl">{icon}</div>
		</div>
	);
}


const ProfilReverse = ({profile, setProfile, info, setInfo}) => {
	return (
		<div className="flex flex-col w-full h-full
		fixed inset-0 items-center justify-center bg-foreground">
			<div className="h-[3%]"></div>
			<div className="rounded-lg w-[50%] md:w-[30%] h-[85%] rounded-lg 
			shadow-lg relative bg-foreground text-black relative 
			flex flex-row text-white">
					<button onClick={() => setInfo(!info)} 
					className="right-3 top-1 font-icon text-accent
					text-xl absolute"></button>
						
					<BoxSection title="">
						<div className="flex flex-row w-full h-full space-x-1">

							<div className="flex flex-col justify-between w-[60%] h-full">
								{profile === true && (<div className="flex flex-col w-full h-full font-geist 
								space-y-3 p-5">
									<SettingBloc type="Last name" value="Ravelonarivo" />
									<SettingBloc type="First name" value="Ravelonarivo" />
									<SettingBloc type="Email" value="Ravelonarivo" />
									<SettingBloc type="Phone" value="Ravelonarivo" />
								</div>)}
								{profile === false && (<div className="flex flex-col w-full h-full font-geist 
								space-y-1 p-2 text-background">
									<strong className="underline">Full name :</strong>
									<p className="">Ravelonarivo Sarah</p>
									<strong className="underline">Email adress :</strong>
									<p className="">Ravelonarivo@gmail.com</p>
									<strong className="underline">Phone number :</strong>
									<p className="">+261324552731</p>
								</div>)}
								
							</div>
							<div className="flex flex-col w-[40%] h-full border-darktone border-l items-center">
								<div className="h-[1%]"></div>
								<div className="flex flex-col w-full h-full">
										<div className="flex flex-col items-start h-full w-full p-5 text-background">
											<button onClick={() => setProfile(!profile)}><Setting icon="󰚼" type="Profile"/></button>
											<Setting icon="󰒃" type="Password"/>
											<Setting icon="󰆴" type="Profile" />
										</div>
								</div>
								<div className="flex flex-row font-icon 
								justify-center items-end p-10">
									<div className="w-full font-geist items-center justify-center
									underline text-accent text-center">
										<Logout type="Logout" icon="󰈆"/> 
									</div>
								</div>
							</div>
						</div>
					</BoxSection>		
			</div>
		</div>
	);
}

const	ProfilePage: React.FC = () => {
	const	{ t } = useTranslation("profile");
	const [info, setInfo] = useState(false);
	const [profile, setProfile] = useState(false);

	return (
		<div className="flex flex-col items-center justify-start
			px-4 md:px-7 xl:px-64
			overflow-y-scroll
			w-full h-full"
		>
			<div className="w-[50%] h-20 flex-none"></div>

			<div className="relative w-[70%]">
				<BoxSection
					title=""
				>
					<div className="absolute right-3 top-1 font-icon text-xl">
						<button onClick={() => setInfo(!info)}></button>
					</div>
					<div className="flex flex-col items-start justify-center"
					>
						<div className="font-bold font-higuen text-accent">
							Ravelonarivo Sarah
						</div>
						<div className="flex flex-col md:flex-row space-x-5">
							<div className="font-light font-inter underline">
								blabla@gmail.com
							</div>
							<div className="font-light font-inter underline">
								+261341091496
							</div>
						</div>
						<div className="flex flex-row">

						</div>
					</div>
				</BoxSection>
			</div>
			<div className="h-[1%]"></div>
			<div className="w-[70%] h-[20%] flex flex-none items-center">
				<BoxSection title="">
					<div className="flex flex-col gap-2 w-full">
						<div className="flex flex-row w-full justify-center">
							<StatValue type="Post" value="1"/>
							<StatValue type="Rent" value="2"/>
							<StatValue type="Sell" value="4"/>
						</div>
						<div className="flex flex-row justify-center">
							<StatValue type="Active" value="1"/>
							<StatValue type="Rate" value="2"/>
							<StatValue type="Response" value="4"/>
						</div>
					</div>
				</BoxSection>
				 {info && (
					<ProfilReverse profile={profile} setProfile={setProfile} info={info} setInfo={setInfo}/>
      			)}
			</div>
			<div className="w-[70%] h-auto ">
				<div className="grid grid-cols-3">
					<div className=""></div>
				</div>
			</div>
		</div>
	);
}
export default ProfilePage;
