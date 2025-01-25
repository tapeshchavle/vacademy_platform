// import { SsdcLogo_Login } from "@/assets/svgs"; // Add the logo here
import Logo from "@/svgs/ssdc-logo.svg"

export default function HeaderLogo() {
  return (
    <div>
    <div className=" flex flex-col w-full items-center justify-center" style={{ padding: '6%' }}>
      {/* <img src={SsdcLogo_Login} alt="logo" style={{ width: '20vw', height: '20vh' }} /> */}
      <Logo />
    </div>
    </div>
  );
}
