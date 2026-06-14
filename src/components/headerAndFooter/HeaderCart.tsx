import { useEffect, useState } from "react"
import { toggleCartDrawer } from "@/services/redux/slices/modalSlice"
import { ShoppingCart } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"




const HeaderCart = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);


    const cartCount = useSelector((state: any) => state.cart.items.length);
    const dispatch = useDispatch();
    return (
        <button
            className="icon-button"
            style={{ position: 'relative' }}
            onClick={() => dispatch(toggleCartDrawer())}
        >
            <ShoppingCart size={20} />
            {mounted && cartCount > 0 && (
                <span
                    style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        minWidth: 18,
                        height: 18,
                        borderRadius: '9999px',
                        background: '#ef4444',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        lineHeight: 1,
                        padding: '0 5px',
                    }}
                >
                    {cartCount}
                </span>
            )}
        </button>
    )
}

export default HeaderCart