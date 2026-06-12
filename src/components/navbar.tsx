import { Link } from "@tanstack/react-router";

const navItems = [
	{ name: "Home", to: "/" },
	{ name: "List Madrasah", to: "/list" },
];

export function Navbar() {
	return (
		<nav className="bg-background fixed inset-0 z-20 h-fit w-full border-b">
			<div className="mx-auto flex h-fit max-w-7xl flex-row items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-16">
				<Link to="/" className="group flex items-center gap-2">
					<span className="bg-primary size-6 rounded-md" />
					<p className="text-primary text-base font-bold sm:text-lg">Pantau SPMB</p>
				</Link>
				<div className="flex flex-row items-center gap-1">
					{navItems.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
							activeProps={{ className: "bg-accent text-foreground!" }}
							activeOptions={{ exact: item.to === "/" }}
						>
							{item.name}
						</Link>
					))}
				</div>
			</div>
		</nav>
	);
}
