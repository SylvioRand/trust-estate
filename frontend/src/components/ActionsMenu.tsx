import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export type	ActionsMenuContent = {
	title: string;
	icon?: string;
	color?: string;
	func: () => void;
}

interface	ActionsMenuProps {
	menu_content: ActionsMenuContent[];
}

const	ActionsMenu: React.FC<ActionsMenuProps> = ({
	menu_content = []
}) => {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
				className="font-icon text-2xl
				select-none
				rounded-full
				outline-accent
				w-8 h-8
				cursor-pointer">
					󰇘
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
				className="bg-foreground rounded-xl
				border border-background/25
				shadow-standard
				p-1"
				>
					{
						menu_content.map((value: ActionsMenuContent, index: number) => {
							if (value.title === "IGNORE")
								return (null);
							return (
								<DropdownMenu.Item
								className="text-background
								hover:bg-background/25
								outline-none
								rounded-md
								p-2
								place-items-center
								gap-2
								cursor-pointer"
								style={{
									display: "grid",
									color: value.color ? value.color : "var(--color-background)",
									gridTemplateColumns: value.icon ? "auto 1fr" : "1fr",
								}}
								key={ index }
								onSelect={ value.func }
								>
									<div
									className="flex items-center justify-center
									w-6 h-6"
									style={{
										textShadow: `0px 0px 4px color-mix(in srgb, ${value.color ? value.color : "var(--color-foreground"} 75%, transparent)`
									}}
									>
										<div
										className="font-icon text-2xl"
										>
											{ value.icon }
										</div>
									</div>
									<div
									className="justify-self-start
									text-shadow-md">
										{ value.title }
									</div>
								</DropdownMenu.Item>
							);
						})
					}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}

export default ActionsMenu;