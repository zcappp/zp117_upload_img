import React from "react"
import css from "./zp117_上传图片.css"

function render(ref) {
    let { props } = ref
    let { dbf, form } = props
    let img
    if (form) {
        ref.form = typeof form == "string" ? ref.excA(form) : form
        if (typeof ref.form == "object") img = ref.form[dbf]
    } else if (ref.getForm) {
        img = ref.getForm(dbf)
    }
    return <React.Fragment>
        {!img && <div className="zp117input"><input onChange={e => onChange(ref, e)} type="file" accept="image/*"/></div>}
        {!img && !ref.file && <div className={props.noLabel ? "zp117noLabel" : ""}><span className="zphoto"><span/></span><label>{props.noLabel ? "" : (props.label || "上传图片")}</label></div>}
        {(ref.file || img) && <img onClick={() => preview(ref, img)} src={ref.file || (img.endsWith("svg") || img.endsWith("ico") ? img : img + "?x-oss-process=image/resize,m_fill,h_300,w_300")}/>}
        {!!ref.file && <div className="zp117progress">{ref.progress}</div>}
        {!!img && <i onClick={e => {e.stopPropagation(); ref.form ? delete ref.form[dbf] : ref.setForm(dbf, ""); ref.exc('render()')}} className="zp117rm zdel"/>}
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
                ref.form ? ref.form[props.dbf] = r.url : ref.setForm(props.dbf, r.url)
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
            <i onClick={() => close(ref)} className="zdel"/>
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
            <i onClick={() => close(ref)} className="zdel"/>
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
            const o = r.arr[0]
            ref.form ? ref.form[props.dbf] = o.url : ref.setForm(props.dbf, o.url)
            if (props.onSuccess) exc(props.onSuccess, { ...ref.ctx, $ext_ctx: ref.ctx, $val: o.url, ...o }, () => exc("render()"))
            close(ref)
        }
    })
}

$plugin({
    id: "zp117",
    props: [{
        prop: "dbf",
        label: "字段名",
        ph: "必填"
    }, {
        prop: "form",
        label: "字段容器",
        ph: "如不填则使用祖先节点的表单容器"
    }, {
        prop: "max",
        type: "number",
        label: "最大文件大小(单位:MB)",
        ph: "默认最大5MB"
    }, {
        prop: "noLabel",
        type: "switch",
        label: "不显示文本"
    }, {
        prop: "label",
        label: "[上传图片] 文本",
        show: "!P.noLabel"
    }, {
        prop: "url",
        type: "switch",
        label: "允许通过URL上传"
    }, {
        prop: "onSuccess",
        type: "exp",
        label: "上传成功表达式",
        ph: "$val"
    }],
    render,
    css
})