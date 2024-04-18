import { Component, OnInit,EventEmitter,Output } from '@angular/core';
import { TaskManagerService } from '../task-manager.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ErrorHandlingServiceService } from '../../service/error-handling-service.service';
import { FormGroup,FormArray,FormBuilder,FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, tap, filter, switchMap, finalize, takeUntil, map } from 'rxjs/operators';
import { ShareddataService } from '../shareddata.service';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
export interface tClient {
  id: string;
  name: string;
}
export interface developclient {
  id: string;
  name: string;
}


@Component({
  selector: 'app-monthlydata',
  templateUrl: './monthlydata.component.html',
  styleUrls: ['./monthlydata.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
})
export class MonthlydataComponent implements OnInit {
    Summary: any=[];
    HeadDate: any=[];
  trclientList: any=[];
  isLoading: boolean;
  trclientTeamLead: any=[];
  develop: any=[];

  constructor(private TaskManagerService:TaskManagerService,private SpinnerService: NgxSpinnerService,
    private fb: FormBuilder, private router: Router, private toastr: ToastrService,
    private errorHandler: ErrorHandlingServiceService,private LocalShareService:ShareddataService,private datePipe:DatePipe) {}
  @Output() OnCancel = new EventEmitter<any>();
  ReportMonthly : FormGroup;
  send_value: String = "";
  Limit=new FormControl('')
  TotalLimit:any=0

  ngOnInit(): void {
    this.ReportMonthly = this.fb.group({
      monthyear: [moment()],
      Team:'',
      TeamLead:'',
      developer_id:''
    });
  }

  backtoTaskSummary(){
    this.OnCancel.emit()
    }

    reportDownload() {
      // this.isShowAddTemplate = true; 
      // this.isShowtimesheet = false;
      this.SpinnerService.show();
  
      let data =this.ReportMonthly.value
      if (this.ReportMonthly.get('monthyear').value == '' || this.ReportMonthly.get('monthyear').value == null || this.ReportMonthly.get('monthyear').value == undefined || this.ReportMonthly.get('monthyear').value == 'None') {
        this.toastr.error("Please Select Month and Year to Proceed");
        return false;
      }
      let formValue = this.ReportMonthly.value;
      let monthyeardata: any = this.datePipe.transform(formValue.monthyear, 'yyyy-MM')
      let splitdata = monthyeardata.split('-')
      // console.log("Spilt Data",splitdata)
      let month = splitdata[1]
      let year = splitdata[0]
      this.send_value = ""
  
      if (month) {
        this.send_value = this.send_value + 'month=' + month
      }
      if (year) {
        this.send_value = this.send_value + '&year=' + year
      }
  
      this.TaskManagerService.getreportmonthly(this.send_value).subscribe(
        (result) => {
          this.SpinnerService.hide();
          let binaryData = [];
          binaryData.push(result)
          let downloadUrl = window.URL.createObjectURL(new Blob(binaryData));
          let link = document.createElement('a');
          link.href = downloadUrl;
          link.download = 'MonthlyTimesheet.xlsx';
          // link.download ='action:excelreport'
          link.click();
        },
        (error) => {
          this.errorHandler.handleError(error);
          this.SpinnerService.hide();
        }
      );
    }
    taskrclient(value){
      this.isLoading=true
      this.TaskManagerService.teamget(value).subscribe(data=>{
        this.isLoading=false
        this.trclientList=data['data'];
      });
    }
    taskTeamLead(value){
      this.isLoading=true
      this.TaskManagerService.getteams(value).subscribe(data=>{
        this.isLoading=false
        this.trclientTeamLead=data['data'];
      });
    }
    public displaydevelopclient(clt?: developclient): string | undefined {
      // console.log(`Client testing data - ${clt.name}`);
      return clt ? clt.name : undefined;
    }
    getDeveloperdrop(data) {
      this.TaskManagerService.getdeveloper(data).subscribe(res=>{
        this.develop = res['data']
      })
    }
  
    
    public displaytrclt(clt?: tClient): string | undefined {
      return clt ? clt.name : undefined;
    }
    resetTasks(){
      this.ReportMonthly.reset();
      
    }

    monyear = new FormControl(moment())
    chosenYearHandler(normalizedYear: Moment) {
      const ctrlValue = this.monyear.value;
      ctrlValue.year(normalizedYear.year());
      this.monyear.setValue(ctrlValue);
    }
    chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
      const ctrlValue = this.monyear.value;
      ctrlValue.month(normalizedMonth.month());
      this.monyear.setValue(ctrlValue);
      datepicker.close();
      this.ReportMonthly.patchValue({
        monthyear: this.monyear.value
      })
    }
    Date=['21/11/2002','22/11/2002','23/11/2002','24/11/2002','25/11/2002','26/11/2002','27/11/2002','28/11/2002']
//     Summary=[
//       {
//         "INFO": [
//             {
//                 "INFO": {
//                     "duration": "7.00",
//                     "flag": [
//                         "Absent"
//                     ]
//                 },
//                 "LOG_DATE": "2024-04-01"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": ["Present"]
//                 },
//                 "LOG_DATE": "2024-04-02"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-03"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": ["Absent"]
//                 },
//                 "LOG_DATE": "2024-04-04"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-05"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": ["Holiday"]
//                 },
//                 "LOG_DATE": "2024-04-06"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-07"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-08"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": ["Weekend"]
//                 },
//                 "LOG_DATE": "2024-04-09"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-10"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-11"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-12"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-13"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-14"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-15"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-16"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-17"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-18"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-19"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-20"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-21"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-22"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-23"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-24"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-25"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-26"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-27"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-28"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-29"
//             },
//             {
//                 "INFO": {
//                     "duration": "0",
//                     "flag": []
//                 },
//                 "LOG_DATE": "2024-04-30"
//             }
//         ],
//         "NAME": "HARIKRISHNAN M-VS0251"
//     }

//     ]
//     HeadDate= [
//       {
//           "INFO": {
//               "duration": "7.00",
//               "flag": [
//                   "Absent"
//               ]
//           },
//           "LOG_DATE": "2024-04-01"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-02"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-03"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-04"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-05"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-06"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-07"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-08"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-09"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-10"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-11"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-12"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-13"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-14"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-15"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-16"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-17"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-18"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-19"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-20"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-21"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-22"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-23"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-24"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-25"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-26"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-27"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-28"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-29"
//       },
//       {
//           "INFO": {
//               "duration": "0",
//               "flag": []
//           },
//           "LOG_DATE": "2024-04-30"
//       }
//   ]
  datass(data){
    console.log('datas',data)
  }
  Submit(){
    console.log('Value',this.Limit.value)
  }
  SummaryFunc(){
    const date=this.ReportMonthly.get('monthyear').value._d
    console.log(this.datePipe.transform(date,'MM'))
    const month=this.datePipe.transform(date,'MM')
    const year=this.datePipe.transform(date,'yyyy')
    console.log('year',this.datePipe.transform(date,'yyyy'))
    let Team=this.ReportMonthly.get('Team').value.id
    let Lead=this.ReportMonthly.get('TeamLead').value.id
    let EmployeeId=this.ReportMonthly.get('developer_id').value.id
    if(!Team){
      Team=''
    }
    if(!Lead){
      Lead=''
    }
    if(!EmployeeId){
      EmployeeId=''
    }

    this.TaskManagerService.TaskSheetMonthReport(month,year,Team,Lead,EmployeeId).subscribe(data=>{
      this.Summary=data['data']
      this.HeadDate=this.Summary[0]['INFO']
      console.log(this.HeadDate)
    })
  }
}
