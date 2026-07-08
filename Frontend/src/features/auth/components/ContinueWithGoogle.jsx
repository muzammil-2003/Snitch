const ContinueWithGoogle = () => {
    return (
        <>
            <div className="relative mt-5 mb-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-surface-variant"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-4 text-on-surface-variant font-label-sm uppercase tracking-widest">
                        Or continue with
                    </span>
                </div>
            </div>

            <a
                href="http://localhost:3000/api/auth/google"
                className="w-full h-11 bg-surface-container-low border border-surface-variant hover:border-primary-container/50 text-on-background active:scale-[0.98] transition-all duration-150 font-label-md text-label-md rounded-lg flex items-center justify-center gap-3 cursor-pointer"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                Continue with Google
            </a>
        </>
    )
};

export default ContinueWithGoogle;