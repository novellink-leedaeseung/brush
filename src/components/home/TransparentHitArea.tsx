// src/components/TransparentHitArea.tsx
import React from 'react';
import {useNavigate} from "react-router-dom";
import { logButtonClick } from '@/utils/ipcLogger';

type Props = {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    zIndex?: number;
    width?: number;
    height?: number;
};

const TransparentHitArea: React.FC<Props> = ({
                                                 top = 0,
                                                 left = 0,
                                                 right,
                                                 bottom,
                                                 zIndex = 100,
                                                 width = 1080,
                                                 height = 686,
                                             }) => {
    const navigate = useNavigate()

    return (
        <button
            type="button"
            aria-label="transparent-button"
            style={{
                position: 'absolute',
                top,
                left,
                right,
                bottom,
                width,
                height,
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                zIndex,
            }}
            data-log-id="transparent-hit-area"
            data-log-skip-global="true"
            onClick={() => {
                const currentPath = typeof window !== 'undefined'
                    ? (window.location?.hash || window.location?.pathname || null)
                    : null
                logButtonClick({
                    buttonId: 'transparent-hit-area',
                    path: currentPath,
                    text: 'transparent-hit-area',
                });
                navigate("/kiosk/user-find")
            }}
        />
    );
};

export default TransparentHitArea;
