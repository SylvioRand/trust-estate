import { useState, useRef, useImperativeHandle, forwardRef, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface ImageUploaderProps {
	dataToPreview: string[];
	setDataToPreview: Dispatch<SetStateAction<string[]>>;
}

export interface ImageUploaderHandle {
	removeFile: (index: number) => void;
	resetFiles: () => void;
}

const ImageUploader = forwardRef<ImageUploaderHandle, ImageUploaderProps>(
	({ dataToPreview = [], setDataToPreview }, ref) => {
		const { t } = useTranslation("publish");
		const [files, setFiles] = useState<File[]>([]);
		const inputRef = useRef<HTMLInputElement | null>(null);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
			let tmp: string[] = [...dataToPreview];

			selectedFiles.forEach((file) => {
				tmp.push(URL.createObjectURL(file));
			});

			setFiles(selectedFiles);
			setDataToPreview(tmp);
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
			if (inputRef.current)
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
				if (inputRef.current) inputRef.current.value = "";
			},
		}));

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
						cursor-pointer
						w-full h-full"
					type="file"
					accept="image/*"
					multiple
					onChange={handleChange}
				/>
			</div>
		);
	}
);

export default ImageUploader;
