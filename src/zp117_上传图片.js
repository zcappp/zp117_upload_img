import React from "react"
import css from "./zp117_上传图片.css"

function render(ref) {
    const { props, getForm } = ref
    if (!getForm) return <div>{camera}<label>请置于表单容器中</label></div>
    if (!props.dbf) return <div>{camera}<label>请配置表单字段</label></div>
    let img = getForm(props.dbf)
    return <React.Fragment>
        <div className="zp117input"><input onChange={e => onChange(ref, e)} type="file" accept="image/*"/></div>
        {ref.file ? <div className="zp117progress">{ref.progress}</div> : (img ? "" : <div className={props.noLabel ? "noLabel" : ""}>{camera}<label>{props.noLabel ? "" : (props.label || "上传图片")}</label></div>)}
        {(ref.file || img) && <img onClick={() => preview(ref, img)} src={ref.file || (img.endsWith("svg") || img.endsWith("ico") ? img : img + "?x-oss-process=image/resize,m_fill,h_300,w_300")}/>}
        {!!img && <svg onClick={e => {e.stopPropagation(); ref.setForm(props.dbf, ""); ref.exc('render()')}} className="zp117rm zsvg" viewBox="64 64 896 896"><path d={remove}/></svg>}
        {!!props.url && !ref.file && <span onClick={() => popUrl(ref)}>URL</span>}
        {ref.modal}
    </React.Fragment>
}

function onChange(ref, e) {
    const { props, exc } = ref
    const file = e.target.files[0]
    if (!file || !file.name) return exc('warn("请选择图片文件")')
    if (file.size / 1048576 > (props.max || 5)) return exc(`warn("文件太大, 请压缩至${props.max || 5}M以下")`)
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
                ref.setForm(props.dbf, r.url)
                if (props.onSuccess) exc(props.onSuccess, { ...ref.ctx, $ext_ctx: ref.ctx, $val: r.url, ...r }, () => ref.exc("render()"))
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

function popUrl(ref) {
    ref.modal = <div className="zmodals">
        <div className="zmask" onClick={() => close(ref)}/>
        <div className="zmodal">
            <svg onClick={() => close(ref)} className="zsvg x" viewBox="64 64 896 896"><path d={remove}/></svg>
            <h3 className="hd">通过URL上传</h3>
            <div className="bd"><input placeholder="输入图片URL" className="zinput"/></div>
            <div className="ft">
                <div className="zbtn" onClick={() => close(ref)}>取消</div>
                <div className="zbtn main" onClick={() => upload(ref)}>上传</div>
            </div>
        </div>
    </div>
    ref.render()
    setTimeout(() => {
        $(".zp117 .zmodals").classList.add("open")
        $(".zp117 .zmodal input").focus()
    }, 99)
}

function preview(ref, img) {
    if (!img) return
    ref.modal = <div className="zmodals">
        <div className="zmask" onClick={() => close(ref)}/>
        <div className="zmodal">
            <svg onClick={() => close(ref)} className="zsvg x" viewBox="64 64 896 896"><path d={remove}/></svg>
            <h3 className="hd">{ref.props.dbf}</h3>
            <div className="zcenter" style={{minHeight:"200px"}}><img src={img}/></div>
        </div>
    </div>
    ref.render()
    setTimeout(() => $(".zp117 .zmodals").classList.add("open"), 99)
}

function close(ref) {
    ref.modal = ""
    ref.render()
}

function upload(ref) {
    const { props, exc } = ref
    let url = $(".zp117 .zmodal input").value
    if (!url) return exc('alert("请输入图片URL")')
    exc('$resource.uploads(urls, "i")', { urls: [url] }, r => {
        if (!r || r.ng.length) exc(`alert("上传出错了", reason)`, { reason: r ? r.ng[0].reason : "" })
        if (r.arr.length) {
            ref.setForm(props.dbf, r.arr[0].url)
            if (props.onSuccess) exc(props.onSuccess, { ...ref.ctx, $ext_ctx: ref.ctx, $val: r.arr[0].url, ...r.arr[0] }, () => exc("render()"))
            close(ref)
        }
    })
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
        label: "onSuccess表达式",
        ph: "$val"
    }, {
        prop: "max",
        type: "number",
        label: "最大文件大小(单位:MB)",
        ph: "默认最大5MB"
    }, {
        prop: "label",
        type: "text",
        label: "【上传图片】文本"
    }, {
        prop: "noLabel",
        type: "switch",
        label: "不显示文本"
    }, {
        prop: "url",
        type: "switch",
        label: "允许通过URL上传"
    }],
    render,
    css
})

const camera = <svg className="zsvg zp117camera" viewBox="0 0 1024 1024"><path d="M384 128l-78.933333 85.333333L170.666667 213.333333c-46.933333 0-85.333333 38.4-85.333333 85.333333l0 512c0 46.933333 38.4 85.333333 85.333333 85.333333l682.666667 0c46.933333 0 85.333333-38.4 85.333333-85.333333L938.666667 298.666667c0-46.933333-38.4-85.333333-85.333333-85.333333l-134.4 0L640 128 384 128zM512 768c-117.333333 0-213.333333-96-213.333333-213.333333s96-213.333333 213.333333-213.333333 213.333333 96 213.333333 213.333333S629.333333 768 512 768zM512 554.666667m-136.533333 0a6.4 6.4 0 1 0 273.066667 0 6.4 6.4 0 1 0-273.066667 0Z"/></svg>
const remove = "M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"