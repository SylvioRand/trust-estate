import { useState, useImperativeHandle, forwardRef, type Dispatch, type SetStateAction, type RefObject, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface ImageUploaderProps {
	dataToPreview: string[];
	setDataToPreview: Dispatch<SetStateAction<string[]>>;
	inputRef: RefObject<HTMLInputElement | null>;
}

export interface ImageUploaderHandle {
	removeFile: (index: number) => void;
	resetFiles: () => void;
}

export const	MAX_IMG = 10;

const	ImageUploader = forwardRef<ImageUploaderHandle, ImageUploaderProps>(
	({ dataToPreview = [], setDataToPreview, inputRef = null }, ref) => {
		const	{ t } = useTranslation(["publish", "error"]);
		const	[files, setFiles] = useState<File[]>([]);
		const	[isDisabled, setIsDisabled] = useState<boolean>(false);
		const	handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const	allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp"]
			const	validFiles: File[] = [...files];
			const	tmp: string[] = [...dataToPreview];
			
			if (e.target.files)
			{
				for (let i = 0; i < e.target.files.length; i++)
				{
					const	file: File = e.target.files[i];

					if (validFiles.length >= MAX_IMG)
					{
						toast.error(t("error:validation.listing.photos.max_count"));
						break ;
					}

					if (file.size > (5 * 1024 * 1024))
					{
						toast.error(file.name + ": " + t( "error:validation.file.too_large"));
						continue ;
					}
					if (!allowedTypes.includes(file.type))
					{
						toast.error(file.name + ": " + t("error:validation.file.invalid_format"));
						continue ;
					}
					validFiles.push(file);
					tmp.push(URL.createObjectURL(file));
				}
			}

			setFiles(validFiles);
			setDataToPreview(tmp);
			if (inputRef?.current)
			{
				const	dataTransfer = new DataTransfer();

				validFiles.forEach((file: File) => {
					dataTransfer.items.add(file);
				});
				inputRef.current.files = dataTransfer.files;
			}
		};

		const handleRemoveFiles = (index: number) => {
			console.log("handleRemoveFiles called");
			URL.revokeObjectURL(dataToPreview[index]);
			const newFiles = files.filter((_, i) => i !== index);


			// need to set the value of the inputRef Filelist here to sync it with the state
			let	newFileList = new DataTransfer();
			newFiles.forEach((file) => {
				newFileList.items.add(file);
			})

			setFiles(newFiles);
			if (inputRef?.current)
				inputRef.current.files = newFileList.files;

			const newPreview = dataToPreview.filter((_, i) => i !== index);
			setDataToPreview(newPreview);
		};

		useImperativeHandle(ref, () => ({
			removeFile: handleRemoveFiles,
			resetFiles: () => {
				files.forEach((_, i) => URL.revokeObjectURL(dataToPreview[i]));
				setFiles([]);
				setDataToPreview([]);
				if (inputRef?.current) inputRef.current.value = "";
			},
		}));
		
		useEffect(() => {
			setIsDisabled(files.length >= MAX_IMG);
		}, [files, setIsDisabled]);
		return (
			<div
				className="flex items-center justify-center
					overflow-hidden
					rounded-md
					relative
					border border-background/25
					shadow-standard
					w-full h-full
					flex-none"
			>
				<div
					className="flex items-center justify-center gap-3
						absolute
						w-full h-full"
						style={{
							opacity: isDisabled ? "25%" : "100%",
						}}
				>
					<div className="font-icon text-2xl">󰐕</div>
					<div className="font-light text-sm">
						{t("section.main.buttons.pictures.upload")}
					</div>
				</div>
				<input
					ref={inputRef}
					className="p-2
						absolute top-0 left-0
						text-transparent
						w-full h-full"
					type="file"
					accept="image/*"
					multiple
					onChange={ handleChange }
					style={{
						cursor: isDisabled ? "not-allowed" : "pointer"
					}}
					disabled={ isDisabled }
				/>
			</div>
		);
	}
);

export default ImageUploader;