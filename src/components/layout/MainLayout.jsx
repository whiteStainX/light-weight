import Typewriter from '../effects/Typewriter';

const MainLayout = ({ children }) => {
  return (
    <div className="h-dvh w-full bg-[#008080] p-4 flex flex-col gap-4">
      <header className="text-center text-white font-mono">
        <h1 className="text-2xl">
          <Typewriter text="Light weight, baby!" />
        </h1>
      </header>
      {children}
    </div>
  )
}

export default MainLayout
