interface FormFieldProps {
    type: string;
    value: string;
}

const FormField : React.FC<FormFieldProps> = ({type, value}: FormFieldProps) => {
    return (
        <div className="flex flex-row">
            <strong>{type} : </strong>
            <span className="ml-2">{value}</span>
        </div>
    );
}

const FormIconField : React.FC<FormFieldProps> = ({type, value}: FormFieldProps) => {
    return (
        <div className="flex flex-row items-center space-x-5">
            {(value === "USER" || value === "MODERATOR")
                ? <div className="font-icon text-4xl text-yellow-300">{type}</div>
                : <div className="font-icon text-4xl ">{type}</div>
            }
            <span className="ml-2">{value}</span>
        </div>
    );
}

export {FormIconField};
export default FormField;