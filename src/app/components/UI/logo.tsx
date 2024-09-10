import Image from "next/image";

export default function Logo() {
	return (
		<div className="flex flex-row gap-2 md:gap-4 items-center absolute top-4 left-4 md:top-8 md:left-8 ">
			<div className="rounded-lg bg-indigo-500 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center shadow">
				<Image src={"/logo.png"} height={30} width={30} alt="Fjal logo" />
			</div>
			<div className="flex flex-col">
				<span className="font-bold text-lg md:text-2xl text-gray-600">Fjal.xyz</span>
				<span className="font-normal text-sm md:text-base text-gray-700">Made by Nik Vogrinec</span>
			</div>
		</div>
	);
}
