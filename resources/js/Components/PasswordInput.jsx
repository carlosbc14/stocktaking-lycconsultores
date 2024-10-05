import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input } from './ui';

export function PasswordInput({ className = '', ...props }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex relative">
            <Input {...props} type={showPassword ? 'text' : 'password'} className="pr-10" />

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff /> : <Eye />}
            </Button>
        </div>
    );
}
