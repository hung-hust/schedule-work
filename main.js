
function formatToString2(n) {
    if (n < 10) {
        return '0' + n
    }

    return n + ''
}

function createNode(innerHTML, tagName = 'div', cl = '') {
    let newNode = document.createElement(tagName)
    newNode.innerHTML = innerHTML
    if (cl != '') {
        newNode.classList.add(cl)
    }
    return newNode
}

class MyTime {
    static parse(timeStr) {
        return new MyTime(timeStr.d, timeStr.m, timeStr.y, timeStr.h, timeStr.mi, timeStr.s)
    }
    static parse2(s) {
        s = s.replaceAll('  ', '').trim()
        let info = s.split(' ')
        let [h, mi] = info[0].split(':')
        let [d, m, y] = info[1].split('/')

        return new MyTime(d, m, y, h, mi)
    }
    constructor(d = -1, m = -1, y = -1, h = -1, mi = -1, s = 0) {
        if (d != -1) {
            this.d = parseInt(d)
            this.m = parseInt(m)
            this.y = parseInt(y)
            this.h = parseInt(h)
            this.mi = parseInt(mi)
            this.s = parseInt(s)
        }
        else {
            let time = new Date()
            this.d = time.getDate()
            this.m = time.getMonth() + 1
            this.y = time.getFullYear()
            this.h = time.getHours()
            this.mi = time.getMinutes()
            this.s = time.getSeconds()
        }
    }
    toString() {
        return `${formatToString2(this.h)}:${formatToString2(this.mi)}:${formatToString2(this.s)} ${formatToString2(this.d)}/${formatToString2(this.m)}/${this.y}`
    }
    HHMM() {
        return `${formatToString2(this.h)}h${formatToString2(this.mi)}p`
    }
    DDMMYY() {
        return `${formatToString2(this.d)}/${formatToString2(this.m)}/${this.y}`
    }
    far() {
        return this.s + this.mi*60 + this.h*3600 + this.d*86400 + this.m*2592000 + (this.y - 2000)*31104000
    }
    sameDay(j2) {
        return this.d == j2.d && this.m == j2.m && this.y == j2.y
    }
}

class Job {
    static parse(job_obj) {
        return new Job(job_obj.name, MyTime.parse(job_obj.startAt), MyTime.parse(job_obj.endAt), job_obj.description, job_obj.id, job_obj.isDone, MyTime.parse(job_obj.createdAt))
    }
    constructor(name, startAt, endAt, description = 'Không có mô tả', id = null, isDone = false, createdAt = null) {
        this.createdAt = createdAt || new MyTime()
        this.id = id || this.createdAt.toString() + name
        this.name = name
        this.startAt = startAt
        this.endAt = endAt
        this.description = description
        this.isDone = isDone
    }
}

function jobNode(job) {
    let nodeDiv = document.createElement('div')

    nodeDiv.classList.add('job-wrapper')

    jobTimeHtml = ''
    if (job.startAt.DDMMYY() == job.endAt.DDMMYY()) {
        jobTimeHtml = `${job.startAt.HHMM()} --> ${job.endAt.HHMM()}`
    }
    else {
        jobTimeHtml = `${job.startAt.HHMM()} ${job.startAt.DDMMYY()} --> ${job.endAt.HHMM()} ${job.endAt.DDMMYY()}`
    }

    nodeDiv.innerHTML = `
    <div class="job-sumary">
        <div class="mark-done ${job.isDone ? 'is-done' : ''}">
            <div class="icon"></div>
        </div>
        <div class="job-title">
            <h1 class="job-name">${job.name}</h1>
            <p class="job-time">${jobTimeHtml}</p>
        </div>
        <button class="delete-job">Xóa</button>
        <button class="view-job-detail">Xem chi tiết</button>
    </div>
    <div id="display-none" class="job-description">
        ${job.description}
    </div>
    `

    nodeDiv.querySelector('.icon').onclick = function () {
        if (job.isDone) {
            job.isDone = false
            nodeDiv.querySelector('.mark-done').classList.remove('is-done')
            saveData()
            refreshPage()
        }
        else {
            job.isDone = true
            nodeDiv.querySelector('.mark-done').classList.add('is-done')
            saveData()
            refreshPage()
        }
    }

    let viewDetailButton = nodeDiv.querySelector('button.view-job-detail')
    viewDetailButton.onclick = function () {
        if (this.innerText == 'Xem chi tiết') {
            this.innerText = 'Ẩn bớt'
            nodeDiv.querySelector('.job-description').id = ''
        }
        else {
            this.innerText = 'Xem chi tiết'
            nodeDiv.querySelector('.job-description').id = 'display-none'
        }
    }

    nodeDiv.querySelector('button.delete-job').onclick = function () {
        for (let i = 0; i < allJobs.length; i++) {
            if (allJobs[i].id == job.id) {
                allJobs.splice(i, 1)
                saveData()
                refreshPage()
                break
            }
        }
    }

    return nodeDiv
}

let allJobs = []

allJobs = JSON.parse(localStorage.getItem('jobs-str') || '[]').map(job_str => {
    return Job.parse(job_str)
})

function saveData() {
    localStorage.setItem('jobs-str', JSON.stringify(allJobs))
}

function refreshPage() {
    let today = new MyTime()

    document.querySelector('.title-today-jobs').innerHTML = `Công việc hôm nay (${today.DDMMYY()})`

    allJobs.sort((j1, j2) => {
        return j2.startAt.far() - j1.startAt.far()
    })

    let list_all_jobs_element = document.querySelector('.list-all-jobs')
    list_all_jobs_element.querySelectorAll('.job-wrapper').forEach(node => {
        node.remove()
    })
    list_all_jobs_element.querySelectorAll('.day-seperate').forEach(node => {
        node.remove()
    })

    let currentDDMMYY = ''

    allJobs.forEach(job => {
        if (job.startAt.DDMMYY() != currentDDMMYY) {
            currentDDMMYY = job.startAt.DDMMYY()
            list_all_jobs_element.append(createNode(currentDDMMYY, 'p', 'day-seperate'))
        }
        list_all_jobs_element.appendChild(jobNode(job))
    })

    let todayJobs = []
    for (let job of allJobs) {
        if (job.startAt.sameDay(today) || job.startAt.sameDay(today)) {
            todayJobs.push(job)
        }
    }
    todayJobs.sort((j1, j2) => {
        return j1.startAt.far() - j2.startAt.far()
    })

    let list_today_jobs_element = document.querySelector('.list-today-jobs')
    list_today_jobs_element.querySelectorAll('.job-wrapper').forEach(node => {
        node.remove()
    })

    todayJobs.forEach(job => {
        list_today_jobs_element.appendChild(jobNode(job))
    })
}

refreshPage()

document.querySelector('.add-job').onclick = function () {
    let __this = this
    __this.id = 'display-none'

    let form = createNode('', 'div', 'add-job-form')
    form.innerHTML = `
        <div class="form-cate">
            <label for="">Tên</label>
            <input type="text" name="" id="job-name">
        </div>
        <div class="form-cate">
            <label for="">Mô tả</label>
            <input type="text" name="" id="job-desc">
        </div>
        <div class="form-cate">
            <label for="">Bắt đầu</label>
            <input type="text" name="" id="job-start">
        </div>
        <div class="form-cate">
            <label for="">Kết thúc</label>
            <input type="text" name="" id="job-end">
        </div>
        <button class="add">
            Thêm
        </button>
        <button class="back">
            Quay lại
        </button>
    `

    let today = new MyTime()

    form.querySelector('#job-start').value = `00:00 ${today.DDMMYY()}`
    form.querySelector('#job-end').value = `00:00 ${today.DDMMYY()}`

    form.querySelector('.add').onclick = function () {
        let jobName = form.querySelector('#job-name').value
        let jobDesc = form.querySelector('#job-desc').value
        let jobStart = form.querySelector('#job-start').value
        let jobEnd = form.querySelector('#job-end').value

        let newJob = new Job(jobName, MyTime.parse2(jobStart), MyTime.parse2(jobEnd), jobDesc)
        allJobs.push(newJob)
        saveData()
        refreshPage()
        form.remove()
        __this.id = ''
    }

    form.querySelector('.back').onclick = function () {
        form.remove()
        __this.id = ''
    }

    document.querySelector('.all-jobs').insertBefore(form, __this)
}
