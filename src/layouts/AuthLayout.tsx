import EYPLEASE_LOGO from "@/assets/icons/icon.png"

interface Props {
	children: React.ReactNode;
}

const AuthLayout = ({ children }: Props) => {
	return (
		<div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-tr from-[#231f56] via-[#3d0a6e] to-[#f0047f]">
			<div className="relative w-full max-w-xl p-8 overflow-hidden bg-white shadow-lg rounded-3xl">
				<div className="absolute top-0 right-0 w-40 h-40 transform translate-x-20 -translate-y-20 bg-indigo-600 rounded-full"></div>
				<div className="absolute bottom-0 left-0 w-40 h-40 transform -translate-x-20 translate-y-20 bg-purple-600 rounded-full"></div>

				<div className="relative z-10 flex flex-col items-center">
					<div className="flex items-center mb-8">
						<img src={EYPLEASE_LOGO} className="w-20 rounded-sm" alt="Eyplease" />
					</div>

					<div className="w-full md:w-2/3">
						{children}
					</div>
				</div>
			</div>
		</div>
	)
}

export default AuthLayout