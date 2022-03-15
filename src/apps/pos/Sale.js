import React from 'react';
import {withRouter} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AuthContext from "flexbiz-core/components/auth/Context";
import withMediaQuery from "flexbiz-core/components/withMediaQuery";
import Frag from "flexbiz-core/components/Frag";
import {EmitEvents,unicode2Ascii} from 'flexbiz-core/utils';
import {server_url_report} from '../../../config';
import Container from './Container';
import Products from './components/Products';
import ProductGroups from './components/ProductGroups';
import Bill from './components/Bill';
import PropTypes from 'prop-types';
import {toast } from 'react-toastify';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import PaymentIcon from '@material-ui/icons/Payment';
import PrintIcon from '@material-ui/icons/Print';
import SendIcon from '@material-ui/icons/Send';
import KitchenIcon from '@material-ui/icons/Kitchen';
import MergeTypeIcon from '@material-ui/icons/MergeType';
import CancelIcon from '@material-ui/icons/Cancel';
import TableIcon from '@material-ui/icons/ViewComfy';
import _ from "lodash";
import { Typography } from '@material-ui/core';
class Sale extends React.PureComponent{
  constructor(props){
    super(props);
    this.billUpdate = this.billUpdate.bind(this);
    this.onBillChange = this.onBillChange.bind(this);
    this.billUpdate = this.billUpdate.bind(this);
    this.loadPBL = this.loadPBL.bind(this);
    this.state={
        voucher:null,
        kho:null,
        productGroup:{},
        openDial:false,
        load:0
    }
  }
  async componentDidMount(){
    this.loadPBL();
    EmitEvents.subscribe("pbl:update",this.billUpdate)
    EmitEvents.subscribe("pbl:new",this.billUpdate)
  }
  componentWillUnmount(){
    EmitEvents.unsubscribe("pbl:update",this.billUpdate)
    EmitEvents.unsubscribe("pbl:new",this.billUpdate)
  }
  billUpdate(data){
    console.log("bill updated",data)
    if(!this.state.voucher || !this.state.voucher._id || this.state.voucher._id===data._id){
        if((this.state.voucher||{})._id===data._id && data.trang_thai==="5"){
            if(!this.isPrinting){
                alert(this.context.apis.getLabel("Bill này đã được thanh toán"));
                this.tables();
            }
        }else{
            //only reload pbl if timesave is before 3 secconds
            if(!this.timeSave || (this.timeSave + 3*1000) < new Date().getTime()){
                this.loadPBL();
            }
        }
    }
  }
  async loadPBL(){
    this.isPrinting = false;
    const ma_kho =  this.props.match.params.ma_kho.toUpperCase();
    const ma_ban = this.props.match.params.ma_ban.toUpperCase();
    let voucher;
    let condition = {trang_thai:{$in:["1","3"]},ma_ban:ma_ban,ma_kho:ma_kho};
    this.context.setProgressStatus(true);
    try{
        const kho = await this.context.apis.asyncGetData(this.context.userInfo.token,"dmkho",{ma_kho:ma_kho},null,true)
        let rows = await this.context.apis.asyncGetList(this.context.userInfo.token,"pbl",{condition:condition});
        if(rows.length>0){
            voucher = rows[0];
        }else{
            voucher ={
                ma_kho:ma_kho,
                ma_ban:ma_ban,
                so_ct:"PBL",
                trang_thai:"1",
                so_khach:1,
                details:[]
            }
            //voucher = await this.savePBL(voucher);
        }
        this.setState({voucher,kho,load:this.state.load+1});
        this.context.setProgressStatus(false);
    }catch(e){
        this.context.alert(e.message||this.context.apis.getLabel("Không thể kết nối với máy chủ"));
    }
  }
  async savePBL(data){
    let _data_for_save = _.cloneDeep(data);
    this.context.setProgressStatus(true);
    this.timeSave = new Date().getTime();
    if(!_data_for_save._id){
        let condition = {trang_thai:"1",ma_ban:_data_for_save.ma_ban,ma_kho:_data_for_save.ma_kho};
        let voucher = await this.context.apis.asyncGetData(this.context.userInfo.token,"pbl",condition);
        if(voucher){
            let details = voucher.details;
            let vs_merge =[_data_for_save]
            vs_merge.map(v=>v.details).reduce((a,b)=>[...a,...b],[]).forEach(p => {
                let item = details.find(d=>d.ma_vt===p.ma_vt && d.ty_le_ck=== p.ty_le_ck);
                if(!item){
                    item = {...p};
                    details.push(item);
                }else{
                    item.sl_xuat += p.sl_xuat;
                    item.sl_order += p.sl_order;
                    item.sl_gui_bep += p.sl_gui_bep;
                    item.sl_gui_bartender += p.sl_gui_bartender;
                    item.tien_hang_nt = item.sl_xuat * item.gia_ban_nt;
                    item.tien_ck_nt += item.tien_ck_nt;
                    item.tien_nt = item.tien_hang_nt - item.tien_ck_nt;
                }
            });
            voucher.tien_ck_hd = (voucher.tien_ck_hd||0) + vs_merge.map(v=>v.tien_ck_hd||0).reduce((a,b)=>a+b,0);
            voucher.tien_evoucher = (voucher.tien_evoucher||0) + vs_merge.map(v=>v.tien_evoucher||0).reduce((a,b)=>a+b,0);
            voucher.evouchers = [...voucher.evouchers,...vs_merge.map(v=>v.evouchers||[]).reduce((a,b)=>a.concat(b),[])]

            voucher.t_tien_nt = details.map(d=>d.tien_hang_nt).reduce((a,b)=>a+b,0);
            voucher.t_ck_nt = details.map(d=>d.tien_ck_nt).reduce((a,b)=>a+b,0) + (voucher.tien_ck_hd||0)+ (voucher.tien_evoucher||0);
            voucher.t_tt_nt = voucher.t_tien_nt - voucher.t_ck_nt;
            _data_for_save = voucher;
        }
    }
    let rs =  await this.context.apis.asyncPostList(this.context.userInfo.token,"pbl",_data_for_save);
    this.context.setProgressStatus(false);
    return rs;
  }
  
  async handleEvouchersChange(evouchers){
    const {voucher} =  this.state;
    voucher.evouchers = [...evouchers];
    voucher.tien_evoucher = voucher.evouchers.map(e=>{
        let so_tien = e.ty_le?Math.roundBy(voucher.t_tien_nt * e.ty_le/100,0):e.so_tien;
        if(e.so_tien_max && so_tien>e.so_tien_max) so_tien = e.so_tien_max;
        e.so_tien_giam = so_tien;
        return so_tien;
      }).reduce((a,b)=>a+b,0);
    try{
        let v = await this.savePBL(voucher);
        this.setState({voucher:v,load:this.state.load+1});
    }catch(e){
        this.context.alert(e.message||this.context.apis.getLabel("Không thể kết nối với máy chủ"));
    }
  }
  async onBillChange(details,_voucher){
    let {voucher} =  this.state;
    let voucher_for_save = _.cloneDeep(voucher)
    if(_voucher){
        voucher_for_save = {...voucher_for_save,..._voucher}
    }
    if(details){
        voucher_for_save.details = details
    }
    try{
        let voucher_saved = await this.savePBL(voucher_for_save);
        this.setState({voucher:voucher_saved,load:this.state.load+1});
        if(voucher_saved.ma_ban!==voucher.ma_ban && this.state.kho.theo_doi_sl_ht){
            //gui thong bao doi ban cho bep va batender
            this.context.alert(this.context.apis.getLabel("Bạn có muốn in phiếu đổi bàn không?"),()=>{
                this.print("5",()=>{
                    
                },(error)=>{
                    this.context.alert(error);
                },false);
            },"blue");
        }

    }catch(e){
        this.context.alert(e.message||this.context.apis.getLabel("Không thể kết nối với máy chủ"));
    }
  }
  createProductsRef(ref){
    this.productsRef = ref;
  }
  createGroupProductsRef(ref){
    this.groupProductsRef = ref;
  }
  createBillRef(ref){
    this.billRef =  ref;
  }
  tables(){
    this.props.history.push(`/shop/${this.props.match.params.ma_kho.toLowerCase()}`);
  }
  evoucher(){
    alert("comming sooon");
  }
  async cancel(){
    if(!this.state.voucher._id){
        return this.tables();
    }
    this.context.alert(this.context.apis.getLabel("Có chắc chắn huỷ phiếu này không?"),async ()=>{
        const {voucher} = this.state;
        voucher.trang_thai ="9";
        this.context.setProgressStatus(true);
        try{
            await this.savePBL(voucher);
            this.tables();
        }catch(e){
            this.context.alert(e.message||"Không thể kết nối với máy chủ");
        }
    })
  }
  async payment(){
    if(!this.state.voucher._id){
        return this.tables();
    }
    await new Promise((resolve)=>{
        (async ()=>{
            if(!this.refPaymentForm){
            const {default:PaymentForm} = await import("./components/PaymentForm")
            this.setState({
                PaymentForm:<PaymentForm onEvouchersChange={this.handleEvouchersChange.bind(this)}  ref={ref=>this.refPaymentForm=ref}/>,
                load:this.state.load+1
            },()=>{
                resolve()
            })
            }else{
                resolve()
            }
        })();
    })
    let voucher = await this.context.apis.asyncGetData(this.context.userInfo.token,"pbl",{_id:this.state.voucher._id});
    if(!voucher) return;
    this.setState({voucher},()=>{
        this.refPaymentForm.open({...this.state.voucher},async (voucher)=>{
            this.context.setProgressStatus(true);
            try{
                this.isPrinting = true;
                const v = await this.savePBL(voucher);
                if(v.trang_thai!=="9"){
                    this.print("1",()=>{
                        this.tables();
                    },()=>{
                        this.tables();
                    })
                }else{
                    this.tables();
                }
                
            }catch(e){
                this.context.alert(e.message||"Không thể kết nối với máy chủ");
            }
        },this.props.mediaQueryMatches);
    })
  }
  async print(loai_bill,onSuccess,onError,useDefaultTempleteIfNotFound=true){
    this.context.setProgressStatus(true);
    let printers = ((this.state.kho||{}).printers||[]).filter(printer=>printer.id_mau_in && (printer.loai_bill==undefined || printer.loai_bill==loai_bill));
    if(printers.length>0){
        await Promise.all(printers.map(printer=>{
            let url = server_url_report + "/api/" + this.state.voucher.id_app + "/pbl/excel/" + printer.id_mau_in + "?_id=" + this.state.voucher._id + `&print=1&access_token=` + this.context.userInfo.token;
            const print_service_url = printer.dia_chi_may_in;
            return (async ()=>{
                if(print_service_url){
                    let url_print = `${print_service_url}?url=${btoa(url)}&printer=${printer.ten_may_in}&width=${printer.do_rong_kho_giay||0}&height=${printer.chieu_dai_kho_giay||0}`;
                    try{
                        await this.context.apis.asyncGet(url_print);
                    }catch(e){
                        await this.printLocal(url);
                    }
                }else{
                    await this.printLocal(url);
                }
            })();
        }));
        this.context.setProgressStatus(false);
        if(onSuccess) onSuccess();
    }else{
        //default template print
        if(useDefaultTempleteIfNotFound){
            try{
                await this.printDefault(this.state.voucher);
                if(onSuccess) onSuccess();
            }catch(e){
                if(onError){
                    onError(this.context.apis.getLabel(e.message || e));
                }else{
                    this.context.alert(this.context.apis.getLabel(e.message || e));
                }
            }
        }else{
            if(onError){
                onError(this.context.apis.getLabel("Không tìm thấy mẫu in phù hợp"));
            }else{
                if(onSuccess) onSuccess();
            }
        }
    }
  }
  async printLocal(url){
    this.context.setProgressStatus(true);
    let stopRunning = ()=>{
        this.context.setProgressStatus(false);
    }
    let content;
    try{
      content = await this.context.apis.asyncGet(url);
    }catch(e){
      return this.context.alert(e.message);
    }
    return new Promise((resolve)=>{
        this.setState({printFrame:null,load:this.state.load+1},()=>{
            let printFrame = <iframe onLoad={()=>{
                let fr = window.frames['printframe'];
                fr.focus();
                stopRunning();
                fr.print();
                setTimeout(()=>{
                    resolve();
                },10);
            }} name="printframe" style={{display:"none",width:"100%",height:"100%"}} srcDoc={content}></iframe>
            this.setState({printFrame,load:this.state.load+1});
        });
    });
  }
  printDefault(voucher){
    this.context.setProgressStatus(true);
    let stopRunning = ()=>{
        this.context.setProgressStatus(false);
    }
    let domain = window.location.origin;
    let urlPrintDefault = `${domain}/#/print/${voucher.id_app}/${this.context.userInfo.token}/${voucher._id}`;
    return new Promise((resolve)=>{
        this.setState({printFrame:null,load:this.state.load+1},()=>{
            let printFrame = <iframe onLoad={()=>{
                setTimeout(()=>{
                    let fr = window.frames['printframe'];
                    fr.focus();
                    stopRunning();
                    fr.print();
                    resolve();
                },3000);
            }} name="printframe" style={{display:"none",width:"100%",height:"100%"}} src={urlPrintDefault}></iframe>
            this.setState({printFrame,load:this.state.load+1});
        });
    });
  }
  async guibep(){
    if(!this.state.voucher._id) return;
    this.context.setProgressStatus(true);
    let voucher = await this.context.apis.asyncGetData(this.context.userInfo.token,"pbl",{_id:this.state.voucher._id});
    if(!voucher) return this.context.setProgressStatus(false);
    this.setState({voucher},()=>{
        this.print("3",()=>{
            const voucher  = this.state.voucher;
            voucher.details.filter(d=>d.sp_yeu_cau_che_bien).forEach(d=>{
                d.sl_gui_bep = d.sl_order;
            })
            this.savePBL(voucher).then(()=>{
                this.setState({voucher,load:this.state.load+1});
                this.context.setProgressStatus(false);
                toast.info(this.context.apis.getLabel("Tất cả các món đã được gửi tới bếp"),{ autoClose: 1500,hideProgressBar:true});
                
            },(e)=>{
                this.context.alert(e.message||this.context.apis.getLabel("Không thể kết nối với máy chủ"));
            })
        },null,false);
    })
  }
  async guibartender(){
    if(!this.state.voucher._id) return;
    this.context.setProgressStatus(true);
    let voucher = await this.context.apis.asyncGetData(this.context.userInfo.token,"pbl",{_id:this.state.voucher._id});
    if(!voucher) return this.context.setProgressStatus(false);
    this.setState({voucher},()=>{
        this.print("4",()=>{
            const voucher  = this.state.voucher;
            voucher.details.filter(d=>d.sp_yeu_cau_pha_che).forEach(d=>{
                d.sl_gui_bartender = d.sl_order;
            })
            this.savePBL(voucher).then(()=>{
                this.setState({voucher,load:this.state.load+1});
                this.context.setProgressStatus(false);
                toast.info(this.context.apis.getLabel("Tất cả các món đã được gửi tới bartender"),{ autoClose: 1500,hideProgressBar:true});
                
            },(e)=>{
                this.context.alert(e.message||this.context.apis.getLabel("Không thể kết nối với máy chủ"));
            })
        },null,false);
    })
  }
  async merge(){
    if(!this.state.voucher._id){
        return;
    }
    await new Promise((resolve)=>{
        (async ()=>{
            if(!this.refMergeForm){
            const {default:MergeForm} = await import("./components/MergeForm")
            this.setState({
                MergeForm:<MergeForm  ref={ref=>this.refMergeForm=ref}/>,
                load:this.state.load+1
            },()=>{
                resolve()
            })
            }else{
                resolve()
            }
        })();
    })
    this.refMergeForm.open(this.state.voucher.ma_kho,this.state.voucher.ma_ban,async (tables)=>{
        if(tables.length>1){
            this.context.setProgressStatus(true);
            try{
                let voucher = this.state.voucher;
                let details = voucher.details;
                let bans = tables.filter(t=>t.ma_ban!==voucher.ma_ban).map(t=>t.ma_ban);
                let condition ={
                    ma_kho:voucher.ma_kho,
                    trang_thai:'1',
                    ma_ban:{$in:bans}
                }
                let vs_merge = (await this.context.apis.asyncGetList(this.context.userInfo.token,"pbl",{condition}));
                vs_merge.map(v=>v.details).reduce((a,b)=>[...a,...b],[]).forEach(p => {
                    let item = details.find(d=>d.ma_vt===p.ma_vt && d.ty_le_ck==p.ty_le_ck);
                    if(!item){
                        item = {...p};
                        details.push(item);
                    }else{
                        item.sl_xuat += p.sl_xuat;
                        item.sl_order += p.sl_order;
                        item.sl_gui_bep += p.sl_gui_bep;
                        item.sl_gui_bartender += p.sl_gui_bartender;
                        item.tien_hang_nt = item.sl_xuat * item.gia_ban_nt;
                        item.tien_ck_nt += p.tien_ck_nt;
                        item.tien_nt = item.tien_hang_nt - item.tien_ck_nt;
                    }
                });

                voucher.tien_ck_hd = (voucher.tien_ck_hd||0) + vs_merge.map(v=>v.tien_ck_hd||0).reduce((a,b)=>a+b,0);
                voucher.tien_evoucher = (voucher.tien_evoucher||0) + vs_merge.map(v=>v.tien_evoucher||0).reduce((a,b)=>a+b,0);
                voucher.evouchers = [...voucher.evouchers,...vs_merge.map(v=>v.evouchers||[]).reduce((a,b)=>a.concat(b),[])]


                voucher.t_tien_nt = details.map(d=>d.tien_hang_nt).reduce((a,b)=>a+b,0);
                voucher.t_ck_nt = details.map(d=>d.tien_ck_nt).reduce((a,b)=>a+b,0) + (voucher.tien_ck_hd||0)+ (voucher.tien_evoucher||0);
                voucher.t_tt_nt = voucher.t_tien_nt - voucher.t_ck_nt;
                voucher = await this.savePBL(voucher);
                this.setState({voucher,load:this.state.load+1});
                //detete old bill
                await Promise.all(vs_merge.map(v=>{
                    console.log("delete pbl",v)
                    return this.context.apis.asyncDeleteList(this.context.userInfo.token,"pbl",v._id);
                }))
                //finish
                this.context.setProgressStatus(false);
            }catch(e){
                this.context.alert(e.message||"Không thể kết nối với máy chủ")
            }
        }
    });
  }
  async note(){
    await new Promise((resolve)=>{
        (async ()=>{
            if(!this.refNoteForm){
            const {default:NoteForm} = await import("./components/NoteForm")
            this.setState({
                NoteForm:<NoteForm  ref={ref=>this.refNoteForm=ref}/>,
                load:this.state.load+1
            },()=>{
                resolve()
            })
            }else{
                resolve()
            }
        })();
    })
    this.refNoteForm.open(this.context.apis.getLabel("Ghi chú"),this.state.voucher.dien_giai,async (dien_giai)=>{
        let voucher = this.state.voucher;
        voucher.dien_giai = dien_giai;
        try{
            let v = await this.savePBL(voucher);
            this.setState({voucher:v});
        }catch(e){
            this.context.alert(e.message||this.context.apis.getLabel("Không thể kết nối với máy chủ"));
        }
        
    });
  }
  async customer(){
    await new Promise((resolve)=>{
        (async ()=>{
            if(!this.refObjectPicker){
            const {default:ObjectPicker} = await import("flexbiz-core/components/ObjectPicker")
            this.setState({
                ObjectPicker:<ObjectPicker ref={ref=>this.refObjectPicker= ref}/>,
                load:this.state.load+1
            },()=>{
                resolve()
            })
            }else{
                resolve()
            }
        })();
    })
    this.refObjectPicker.open("customer",this.context.apis.getLabel("Chọn một khách hàng"),async (cust)=>{
        let voucher = this.state.voucher;
        voucher.ma_kh = cust.ma_kh;
        voucher.ten_kh = cust.ten_kh;
        try{
            voucher = await this.savePBL(voucher);
            this.setState({voucher,load:this.state.load+1})
        }catch(e){
            this.context.alert(e.message||this.context.apis.getLabel("Không thể kết nối với máy chủ"));
        }
    });
  }
  handleGroupClick(productGroup){
    this.setState({productGroup:productGroup,load:this.state.load+1});
    if(this.productsRef) this.productsRef.loadProducts(productGroup._id,this.state.voucher.ma_ban,this.state.voucher.ma_kho,this.state.voucher.ma_kh);
  }
  handleProductClick(product){
    this.billRef.add(product);
    toast.info(`${this.context.apis.getLabel("Đã thêm")} ${product.ten_vt}`,{ autoClose: 1500,hideProgressBar:true})
  }
  async searchProduct(q){
    if(!q) return;
    this.setState({productGroup:{ten_nvt:`${this.context.apis.getLabel("Tìm")} "${q}"`},load:this.state.load+1});
    let condition = {$or:[],ma_nvt: {$in:this.groupProductsRef.getGroups().map(g=>g._id)}};
    //
    condition.$or.push({ma_vt:{$regex:q,$options:"i"}});
    let $search = await unicode2Ascii(q);
    condition.$or.push({$text:{ $search: q + " " + $search}});  
    //
    this.productsRef.search(condition,this.state.voucher.ma_ban,this.state.voucher.ma_kho,this.state.voucher.ma_kh);
  }
  render(){
    if(!this.state.voucher) return null;
    let t_sl_gui_bep = (this.state.voucher.details||[]).filter(d=>d.sp_yeu_cau_che_bien).map(d=>Math.max(d.sl_gui_bep||0,d.sl_xuat)).reduce((a,b)=>a+b,0);
    let t_sl_gui_bartender = (this.state.voucher.details||[]).filter(d=>d.sp_yeu_cau_pha_che).map(d=>Math.max(d.sl_gui_bartender||0,d.sl_xuat)).reduce((a,b)=>a+b,0);
    let t_sl_order_bep = (this.state.voucher.details||[]).filter(d=>d.sp_yeu_cau_che_bien).map(d=>d.sl_order||0).reduce((a,b)=>a+b,0);
    let t_sl_order_bartender = (this.state.voucher.details||[]).filter(d=>d.sp_yeu_cau_pha_che).map(d=>d.sl_order||0).reduce((a,b)=>a+b,0);
    return (
        <div style={{height:(this.props.mediaQueryMatches?null:"100%"),display:"flex",flexDirection:"column"}}>
            <div style={{flexGrow:1}}>
                <Grid container spacing={0} style={{height:(this.props.mediaQueryMatches?null:"100%")}} >
                    <Grid item  xs={12} sm={12} md={8} lg={8} style={{height:(this.props.mediaQueryMatches?null:"100%")}}>
                        <div style={{height:(this.props.mediaQueryMatches?null:"100%"),display:"flex",flexDirection:"column"}}>
                            <Frag style={{margin:10,padding:0}} title={this.context.apis.getLabel("Nhóm sản phẩm")} contentStyle={{paddingLeft:10,paddingRight:10,paddingBottom:0,paddingTop:0}}>
                                <ProductGroups  ref={this.createGroupProductsRef.bind(this)} mediaQueryMatches ={this.props.mediaQueryMatches}  onGroupClick={this.handleGroupClick.bind(this)}/>  
                            </Frag>
                            <Frag style={{flexGrow:1,margin:0,marginLeft:10,marginRight:10,padding:0}}  title={this.state.productGroup.ten_nvt}  contentStyle={{paddingLeft:10,paddingRight:10,paddingBottom:0,paddingTop:0}}>
                                <div  style={{height:(this.props.mediaQueryMatches?null:"calc(100vh - 313px)"),overflowY:(this.props.mediaQueryMatches?"hidden":"auto"),overflowX:"hidden"}}>
                                    <Products mediaQueryMatches ={this.props.mediaQueryMatches} ref={this.createProductsRef.bind(this)} onProductClick={this.handleProductClick.bind(this)}/> 
                                </div>
                            </Frag>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} style={{height:"100%"}}>
                        <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
                            <Frag style={{flexGrow:1,padding:0,margin:0,marginTop:10,marginRight:10,marginLeft:(this.props.mediaQueryMatches?10:0)}} contentStyle={{padding:10}}>
                                <Bill mediaQueryMatches={this.props.mediaQueryMatches} ref={this.createBillRef.bind(this)} kho={this.state.kho} style={{height:(this.props.mediaQueryMatches?null:"calc(100vh - 173px)"),overflow:"auto"}} voucher={this.state.voucher} onBillChange={this.onBillChange}/>
                            </Frag>
                        </div>
                    </Grid>
                </Grid>
            </div>
            {!this.props.mediaQueryMatches &&
            <div>
                <Frag style={{marginTop:10,paddingTop:10}}>
                    <Grid container spacing={1} justify={this.props.mediaQueryMatches?"space-between":"space-between"}>
                        <Grid item md={1} lg={1}>
                            <Button fullWidth variant="contained" color="primary" onClick={this.tables.bind(this)}>
                                {this.context.apis.getLabel("DS bàn")}
                            </Button>
                        </Grid>
                        {!this.state.kho.theo_doi_sl_ht && 
                        <Grid item md={2} lg={2}>
                            <Button fullWidth variant="contained" color="primary" onClick={this.customer.bind(this)}>
                                {this.context.apis.getLabel("Khách hàng")}
                            </Button>
                        </Grid>
                        }
                        <Grid item md={2} lg={2}>
                            <Button fullWidth variant="contained" disabled={!this.state.voucher._id} color="primary" onClick={this.merge.bind(this)}>
                                {this.context.apis.getLabel("Gộp bill")}
                            </Button>
                        </Grid>
                        {this.state.kho.theo_doi_sl_ht && 
                        <>
                            <Grid item md={2} lg={2}>
                                <Button fullWidth variant="contained" disabled={t_sl_order_bep<=t_sl_gui_bep}  color="primary" onClick={this.guibep.bind(this)}>
                                    {this.context.apis.getLabel("Gửi bếp")}
                                </Button>
                            </Grid>
                            <Grid item md={2} lg={2}>
                                <Button fullWidth variant="contained" disabled={t_sl_order_bartender<=t_sl_gui_bartender}  color="primary" onClick={this.guibartender.bind(this)}>
                                    {this.context.apis.getLabel("Gửi bartender")}
                                </Button>
                            </Grid>
                        </>
                        }
                        <Grid item md={2} lg={2}>
                            <Button fullWidth variant="contained" disabled={!this.state.voucher._id} color="primary" onClick={()=>{
                                    // eslint-disable-next-line react/no-direct-mutation-state
                                    this.state.voucher.trang_thai="3";
                                    this.savePBL(this.state.voucher).then(()=>{
                                        this.print("2");
                                    },(e)=>{
                                        this.context.alert(e.message||e);
                                    })
                                }
                            }>
                                {this.context.apis.getLabel("In tạm tính")}
                            </Button>
                        </Grid>
                        <Grid item md={this.state.kho.theo_doi_sl_ht?2:4} lg={this.state.kho.theo_doi_sl_ht?2:4}>
                            <Button fullWidth  disabled={!this.state.voucher._id} variant="contained" color="primary" onClick={this.payment.bind(this)}>
                                {this.context.apis.getLabel("Thanh toán")}
                            </Button>
                        </Grid>
                        <Grid item md={1} lg={1}>
                            <Button fullWidth variant="contained" color="warning"  onClick={this.cancel.bind(this)}>
                                {this.context.apis.getLabel("Huỷ")}
                            </Button>
                        </Grid>
                    </Grid>
                </Frag>
            </div>
            }
            {this.props.mediaQueryMatches &&
                <SpeedDial
                    ariaLabel="Chức năng"
                    style={{
                        position: 'fixed',
                        bottom: 5,
                        right: 5,
                    }}
                    hidden={!this.state.kho}
                    icon={<SpeedDialIcon />}
                    onClose={()=>{
                        this.setState({openDial:false})
                    }}
                    onOpen={()=>{
                        this.setState({openDial:true})
                    }}
                    open={this.state.openDial}
                >
                    {this.state.voucher._id &&
                    <SpeedDialAction
                        icon={<PaymentIcon  style={{color:this.context.config.primaryColor}}/>}
                        tooltipTitle={<Typography variant="caption"  style={{color:this.context.config.primaryColor}} noWrap>{this.context.apis.getLabel("Thanh toán")}</Typography>}
                        tooltipOpen
                        onClick={this.payment.bind(this)}
                    />}
                    {this.state.voucher._id &&
                    <SpeedDialAction
                        icon={<PrintIcon  style={{color:this.context.config.primaryColor}}/>}
                        tooltipTitle={<Typography variant="caption"  style={{color:this.context.config.primaryColor}}  noWrap>{this.context.apis.getLabel("In tạm tính")}</Typography>}
                        tooltipOpen
                        onClick={()=>{
                            // eslint-disable-next-line react/no-direct-mutation-state
                            this.state.voucher.trang_thai="3";
                            this.savePBL(this.state.voucher).then(()=>{
                                this.print("2");
                            },(e)=>{
                                this.context.alert(e.message||e);
                            })
                        }
                    }
                    />
                    }
                    {t_sl_order_bartender>t_sl_gui_bartender &&
                    <SpeedDialAction
                        icon={<SendIcon  style={{color:this.context.config.primaryColor}}/>}
                        tooltipTitle={<Typography variant="caption"  style={{color:this.context.config.primaryColor}}  noWrap>{this.context.apis.getLabel("Gửi bartender")}</Typography>}
                        tooltipOpen
                        onClick={this.guibartender.bind(this)}
                    />}
                    {t_sl_order_bep>t_sl_gui_bep &&
                    <SpeedDialAction
                        icon={<KitchenIcon  style={{color:this.context.config.primaryColor}}/>}
                        tooltipTitle={<Typography variant="caption"  style={{color:this.context.config.primaryColor}}  noWrap>{this.context.apis.getLabel("Gửi bếp")}</Typography>}
                        tooltipOpen
                        onClick={this.guibep.bind(this)}
                    />}

                    {this.state.voucher._id &&
                    <SpeedDialAction
                        icon={<MergeTypeIcon  style={{color:this.context.config.primaryColor}}/>}
                        tooltipTitle={<Typography variant="caption"  style={{color:this.context.config.primaryColor}}  noWrap>{this.context.apis.getLabel("Gộp bàn")}</Typography>}
                        tooltipOpen
                        onClick={this.merge.bind(this)}
                    />}
                    
                    <SpeedDialAction
                        icon={<TableIcon  style={{color:this.context.config.primaryColor}}/>}
                        tooltipTitle={<Typography variant="caption"  style={{color:this.context.config.primaryColor}}  noWrap>{this.context.apis.getLabel("Danh sách bàn")}</Typography>}
                        tooltipOpen
                        onClick={this.tables.bind(this)}
                    />

                    <SpeedDialAction
                        icon={<CancelIcon style={{color:"red"}}/>}
                        tooltipTitle={<Typography variant="caption"  style={{color:"red"}}  noWrap>{this.context.apis.getLabel("Huỷ")}</Typography>}
                        tooltipOpen
                        onClick={this.cancel.bind(this)}
                    />
                    
                </SpeedDial>
            }
            {this.state.NoteForm}
            {this.state.ObjectPicker}
            {this.state.PaymentForm}
            {this.state.MergeForm}
            {this.state.printFrame}
        </div>
    )
  }
}
Sale.contextType = AuthContext;
Sale.propTypes={
  match: PropTypes.any,
  mediaQueryMatches: PropTypes.bool,
  history:PropTypes.any,
}
class SalePage extends React.PureComponent{
  componentDidMount(){}
  render(){
    return (
        <Container requireLogin {...this.props}  showDrawerIfIsDesktop={false} onSearch={(q)=>{
            this._sale.searchProduct(q);
        }} placeholderSearch ={this.context.apis.getLabel("Tìm sản phẩm...")}>
            <Sale {...this.props} ref={ref=>this._sale=ref} />
        </Container>
    )
  }
}
SalePage.contextType = AuthContext;
export default withRouter(withMediaQuery('(max-width:900px)')(SalePage));