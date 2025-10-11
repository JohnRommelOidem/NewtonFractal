import vertexShaderSource from './vertexShader.glsl?raw';
import fragmentShaderSource from './fragmentShader.glsl?raw';

function createShader(gl, type, source){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader){
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)){
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function setGeometry(gl){
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        1, 1,
        -1, 1,
        1, -1,
        -1, -1
    ]),gl.STATIC_DRAW)
}

function getUniformLocations(gl, uniforms, program){
    for (const [name, uniform] of Object.entries(uniforms)){
        if (name.startsWith("u_")){
            uniform.location = gl.getUniformLocation(program, name);
        }
    }
}

function uploadUniforms(gl, uniforms){
    for (const[_, {location, type, value}] of Object.entries(uniforms)){
            switch (type){
                case "1f": gl.uniform1f(location, value); break;
                case "2f": gl.uniform2f(location, ...value); break;
                case "3f": gl.uniform3f(location, ...value); break;
                case "1i": gl.uniform1i(location, value); break;
                case "2fv": gl.uniform2fv(location, new Float32Array(value.flat())); break;
                case "3fv": gl.uniform3fv(location, new Float32Array(value.flat())); break;
            }
        }
}

export function initGl(canvas, uniforms){
    const gl = canvas.getContext("webgl2");
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionLocation = gl.getAttribLocation(program, "a_position");

    getUniformLocations(gl, uniforms, program)

    const positionBuffer = gl.createBuffer();
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);
    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    function drawScene(){
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.15, 0.15, 0.15, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        uploadUniforms(gl, uniforms)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    return drawScene;
}