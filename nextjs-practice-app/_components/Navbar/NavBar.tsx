import LogoutButton from "../auth/LogoutBtn"
import HomeButton from "../generic/HomeBtn";

const NavBar = () => {
  return (
    <header>
        <nav>
            <div className="navbar sticky top-0 z-50 bg-gray-900 text-white dark:bg-gray-900 dark:text-gray-200">
                <div className="navbar-start w-full">
                    <ul className="menu menu-horizontal px-1">
                        <li><a href="/apparel">Dashboard</a></li>
                        <li className="dropdown dropdown-hover">
                            <label className="cursor-pointer">Inventory</label>
                            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50 mt-0 text-gray-800 dark:text-gray-200">
                                <li><a href="/inv/view">View All</a></li>
                                <li><a href="/inv/add">Add New</a></li>
                                <li><a href="/inv/reports">Reports</a></li>
                            </ul>
                        </li>
                        <li className="dropdown dropdown-hover">
                            <label className="cursor-pointer">Style Card</label>
                            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50 mt-0 text-gray-800 dark:text-gray-200">
                                <li><a href="/style/view">View All</a></li>
                                <li><a href="/style/add">Add New</a></li>
                                <li><a href="/style/reports">Reports</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div className="navbar-end">
                    <LogoutButton />
                    <HomeButton />
                </div>
            </div>
        </nav>
    </header>
  )
}

export default NavBar