// src/components/TransparentHitArea.tsx
import React from 'react';
import {useNavigate} from "react-router-dom";

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
            onClick={() => {
                // TODO: 클릭 시 실행할 코드를 여기에 작성
                navigate("/kiosk/user-find")
            }}
        />
    );
};

export default TransparentHitArea;
