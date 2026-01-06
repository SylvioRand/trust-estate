
interface ToggleRoleProps {
    role: string;
    setRole: (r: string) => void;
}


const ToggleRole = ({role, setRole} : ToggleRoleProps) => {
    return (
        <div className="flex flex-row space-x-2 
        p-4 w-1/3 h-10 items-center rounded-lg 
        text-white justify-between m-5">
            <button
                onClick={() => setRole("Customer")}
                className={`rounded-lg w-1/2 
                    ${role === "Customer" ? "bg-white text-black" : "bg-black text-white"}`}
            >
                Customer                    
            </button>

            <button
                onClick={() => setRole("Seller")}
                className={`rounded-lg w-1/2
                    ${role === "Seller" ? "bg-white text-black" : "bg-black text-white"}`}
            >
                Seller
            </button>

        </div>
    );
}

const ModeratorToggle = ({role, setRole} : ToggleRoleProps) => {
    return (
        <div className="flex flex-row w-1/3 p-2 bg-gray-800 rounded-xl shadow-lg">
            <button
                onClick={() => setRole("Global")}
                className={`w-1/2 py-2 rounded-lg font-semibold transition-all duration-300 
          ${role === "Global" 
            ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-md" 
            : "bg-gray-700 text-white hover:bg-gray-600"}`}
            >
                User_list                    
            </button>

            <button
                onClick={() => setRole("User")}
                className={`w-1/2 py-2 rounded-lg font-semibold transition-all duration-300 
          ${role === "User" 
            ? "bg-gradient-to-r from-blue-400 to-blue-600 text-black shadow-md" 
            : "bg-gray-700 text-white hover:bg-gray-600"}`}
            >
                Global_stat
            </button>

        </div>
    );
}

export {ModeratorToggle};
export default ToggleRole;