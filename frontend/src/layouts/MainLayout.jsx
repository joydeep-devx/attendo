import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({ children }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex flex-1 flex-col min-w-0 min-h-0">
                <Navbar />
                <main className="flex-1 overflow-y-auto px-8 py-7">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
