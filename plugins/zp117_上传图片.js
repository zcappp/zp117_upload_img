import React from "react"
import css from "../css/zp117_上传图片.css"

function render(ref) {
    if (!ref.props.dbf) return <div>请配置表单字段</div>
    let img = ref.getForm(ref.props.dbf)
    return <React.Fragment>
        <input onChange={e => onChange(ref, e)} type="file" accept="image/*"/>
        {ref.file ? <div>{ref.progress}</div> : (img ? "" : <div>{svg}<label>{ref.props.label || "上传图片"}</label></div>)}
        {(ref.file || img) && <img src={ref.file || (img.endsWith("svg") || img.endsWith("ico") ? img : img + "?x-oss-process=image/resize,m_fill,h_300,w_300")}/>}
    </React.Fragment>
}

function onChange(ref, e) {
    const { exc } = ref
    const file = e.target.files[0]
    if (!file || !file.name) return exc('warn("请选择图片文件")')
    if (file.size / 1048576 > (ref.props.max || 5)) return exc(`warn("文件太大, 请压缩至${ref.props.max || 5}M以下")`)
    ref.file = URL.createObjectURL(file)
    ref.progress = "0%"
    ref.render()
    ref.container.classList.add("uploading")
    exc('upload(file, option)', {
        file,
        option: {
            onProgress: r => {
                ref.progress = r.percent + "%"
                ref.render()
            },
            onSuccess: r => {
                ref.setForm(ref.props.dbf, r.url)
                if (ref.props.onSuccess) exc(ref.props.onSuccess, { ...ref.ctx, $ext: ref.ctx, ...r }, () => ref.exc("render()"))
                clean(ref)
            },
            onError: r => {
                exc(`alert("上传出错了", r.error)`, { r })
                clean(ref)
            }
        }
    })
}

function clean(ref) {
    URL.revokeObjectURL(ref.file)
    delete ref.file
    delete ref.progress
    ref.render()
    ref.container.classList.remove("uploading")
}

$plugin({
    id: "zp117",
    props: [{
        prop: "dbf",
        type: "text",
        label: "表单字段"
    }, {
        prop: "onSuccess",
        type: "exp",
        label: "onSuccess表达式"
    }, {
        prop: "max",
        type: "number",
        label: "最大文件大小(单位:MB)",
        ph: "默认最大5MB"
    }, {
        prop: "label",
        type: "text",
        label: "【上传图片】文本"
    }],
    render,
    css
})

const svg = <svg className="zsvg" viewBox="0 0 1024 1024"><path d="M384 128l-78.933333 85.333333L170.666667 213.333333c-46.933333 0-85.333333 38.4-85.333333 85.333333l0 512c0 46.933333 38.4 85.333333 85.333333 85.333333l682.666667 0c46.933333 0 85.333333-38.4 85.333333-85.333333L938.666667 298.666667c0-46.933333-38.4-85.333333-85.333333-85.333333l-134.4 0L640 128 384 128zM512 768c-117.333333 0-213.333333-96-213.333333-213.333333s96-213.333333 213.333333-213.333333 213.333333 96 213.333333 213.333333S629.333333 768 512 768zM512 554.666667m-136.533333 0a6.4 6.4 0 1 0 273.066667 0 6.4 6.4 0 1 0-273.066667 0Z"/></svg>