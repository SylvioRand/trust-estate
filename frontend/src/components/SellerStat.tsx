interface BlocStatProps { 
    icon: string;
    type: string; 
    value: string | number; 
}



const BlocStat : React.FC<BlocStatProps> = ({icon, type, value}) => {
    return(
        <div className="w-2/3 h-2/3 
                bg-gradient-to-b from-gray-500 to-gray-600
                rounded-2xl shadow-xl 
                flex flex-col items-center justify-center 
                font-serif text-black space-y-6 p-8 border border-yellow-300">
                <div className="text-lg font-semibold tracking-wide uppercase text-white">{type}</div>
            <div className="text-3xl font-bold font-icon text-yellow-400 drop-shadow-lg">{icon} {value}</div>
        </div>
    );
}

const SellerStat : React.FC = () => {
    return (
    <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="flex flex-row h-1/2 w-full">
            <div className="flex flex-col  w-1/2 h-full justify-center items-center">
                <BlocStat icon="" type="SUCCESSFUL SALES" value="2"/>
            </div>
            <div className="flex w-1/2 h-full  text-black  justify-center items-center">
                <BlocStat icon="󰿆" type="ACTIVE LISTING" value="3"/>
            </div>
        </div>
        <div className="flex flex-row h-1/2 w-full ">
            <div className="flex w-1/2 h-full  justify-center items-center">
                 <BlocStat icon="󰓎" type="AVERAGE RATING" value="4.5"/>
            </div>
            <div className="flex w-1/2 h-full  justify-center items-center">
                 <BlocStat icon="󰪞" type="TOTAL LISTING" value="3"/>
            </div>
        </div>
    </div>
    );
}

const CustomerStat : React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex flex-col  w-1/2 h-1/2 justify-center items-center">
                <BlocStat icon="" type="CREDIT BALANCE" value="2"/>
            </div>
        </div>
    );
}

export {CustomerStat};

export default SellerStat;