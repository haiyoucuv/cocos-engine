/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { PipelineState, PipelineStateInfo } from '../base/pipeline-state';
import { IWebGL2GPUPipelineState } from './webgl2-gpu-objects';
import { WebGL2RenderPass } from './webgl2-render-pass';
import { WebGL2Shader } from './webgl2-shader';
import { DynamicStateFlagBit } from '../base/define';
import { WebGL2PipelineLayout } from './webgl2-pipeline-layout';
import { WebGLConstants } from '../gl-constants';

const WebGLPrimitives: GLenum[] = [
    WebGLConstants.POINTS,
    WebGLConstants.LINES,
    WebGLConstants.LINE_STRIP,
    WebGLConstants.LINE_LOOP,
    WebGLConstants.NONE,
    WebGLConstants.NONE,
    WebGLConstants.NONE,
    WebGLConstants.TRIANGLES,
    WebGLConstants.TRIANGLE_STRIP,
    WebGLConstants.TRIANGLE_FAN,
    WebGLConstants.NONE,
    WebGLConstants.NONE,
    WebGLConstants.NONE,
    WebGLConstants.NONE,
];

/** @mangle */
export class WebGL2PipelineState extends PipelineState {
    constructor () {
        super();
    }

    get gpuPipelineState (): IWebGL2GPUPipelineState {
        return  this._gpuPipelineState!;
    }

    private _gpuPipelineState: IWebGL2GPUPipelineState | null = null;

    public initialize (info: Readonly<PipelineStateInfo>): void {
        this._primitive = info.primitive;
        this._shader = info.shader;
        this._pipelineLayout = info.pipelineLayout;
        const bs = this._bs;
        if (info.blendState) {
            const bsInfo = info.blendState;
            const { targets } = bsInfo;
            if (targets) {
                targets.forEach((t, i): void => {
                    bs.setTarget(i, t);
                });
            }

            if (bsInfo.isA2C !== undefined) { bs.isA2C = bsInfo.isA2C; }
            if (bsInfo.isIndepend !== undefined) { bs.isIndepend = bsInfo.isIndepend; }
            if (bsInfo.blendColor !== undefined) { bs.blendColor = bsInfo.blendColor; }
        }
        Object.assign(this._rs, info.rasterizerState);
        Object.assign(this._dss, info.depthStencilState);
        this._is = info.inputState;
        this._renderPass = info.renderPass;
        this._dynamicStates = info.dynamicStates;

        const dynamicStates: DynamicStateFlagBit[] = [];
        for (let i = 0; i < 31; i++) {
            if (this._dynamicStates & (1 << i)) {
                dynamicStates.push(1 << i);
            }
        }

        this._gpuPipelineState = {
            glPrimitive: WebGLPrimitives[info.primitive],
            gpuShader: (info.shader as WebGL2Shader).gpuShader,
            gpuPipelineLayout: (info.pipelineLayout as WebGL2PipelineLayout).getGpuPipelineLayout(),
            rs: info.rasterizerState,
            dss: info.depthStencilState,
            bs: info.blendState,
            gpuRenderPass: (info.renderPass as WebGL2RenderPass).getGpuRenderPass(),
            dynamicStates,
        };
    }

    public destroy (): void {
        this._gpuPipelineState = null;
    }
}
