import ModeToggle from "../ui/mode-toggle";
import HeaderNavList from "./header-nav-list";

const Header = () => {
  return (
    <header className="relative top-0 left-0 right-0 z-50 w-full py-4 px-2">
      <div className="absolute top-4 left-4">
        <ModeToggle />
      </div>
      <HeaderNavList />
    </header>
  );
};

export default Header;
