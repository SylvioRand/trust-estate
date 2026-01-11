
import { useState, useRef, useImperativeHandle, forwardRef, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface ImageUploaderProps {
	dataToPreview: string[];
	setDataToPreview: Dispatch<SetStateAction<string[]>>;
}

// Define the methods you want to expose
export interface ImageUploaderHandle {
	removeFile: (index: number) => void;
	resetFiles: () => void; // optional, example
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
			setFiles(newFiles);

			const newPreview = dataToPreview.filter((_, i) => i !== index);
			setDataToPreview(newPreview);
		};

		// Expose methods to parent
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
					rounded-2xl
					relative
					border border-background/25
					shadow-standard
					flex-none
					w-30 h-30"
			>
				<div
					className="flex flex-col items-center justify-center
						absolute
						w-full h-full"
				>
					<div className="font-icon text-4xl">󰐕</div>
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
					onChange={handleChange}
				/>
			</div>
		);
	}
);

export default ImageUploader;
