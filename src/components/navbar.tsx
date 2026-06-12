import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";

const navItems = [
	{ name: "Home", to: "/" },
	{
		name: "List Madrasah",
		to: "/list",
	},
];
export function Navbar() {
	return (
		<nav className="bg-background fixed inset-0 z-10 h-fit w-full border-b">
			<div className="flex h-fit flex-row items-center justify-between gap-4 p-4 px-6 sm:px-8 lg:px-16">
				<p className="text-base font-bold sm:text-lg lg:text-xl">Pantau SPMB</p>
				<div className="flex flex-row items-center justify-between gap-2">
					{navItems.map((item) => (
						<Link key={item.to} to={item.to} className={buttonVariants({ variant: "link" })}>
							{item.name}
						</Link>
					))}
				</div>
			</div>
		</nav>
	);
}
