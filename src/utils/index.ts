import { IGenericFilter } from "@/interfaces/common"

export const convertFiltersToQueryString = (filters: IGenericFilter): string => {
    let queryString = ''

    for (const [key, value] of Object.entries(filters)) {
        // if (Array.isArray(value) && value.length > 0) {
        //     value.forEach((item: ItemValue) => {
        //         queryString += `${key}=${item?.id || item}&`
        //     })
        // }

        // if (key === 'dates') {
        //     const { field, startDate, endDate } = value as FilterValues['dates']
        //     if (field && startDate && endDate) {
        //         queryString += `dateFilter[field]=${field}&`
        //         queryString += `dateFilter[startDate]=${dateToStartOfDay(startDate)}&`
        //         queryString += `dateFilter[endDate]=${dateToEndOfDay(endDate)}&`
        //     }
        // }

        if (!['object', 'number'].includes(typeof value) && value) {
            queryString += `${key}=${value}&`
        }

        if (typeof value === 'number') {
            queryString += `${key}=${key !== 'page' && [0, 1].includes(value) ? Boolean(value) : value}&`
        }
    }
    return queryString.slice(0, -1)
}

export const objectToQueryParams = (obj: Record<string, any>): string => {
    const params = new URLSearchParams()
    const { filters, ...rest } = obj
    Object.entries({ ...rest, ...(filters ? filters : {}) }).forEach(([key, value]) => {
        params.append(key, value as string)
    })
    return params.toString()
}

export const formatCurrency = (value = 0, currency = 'USD') => {
    if (!value) return '$0.00'
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    })
}

export const uploadS3 = async (file: File, url: string) => {
    await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

export const getFileType = (mimetype: string) => {
    const type = mimetype.split('/')[1]
    return type === 'jpeg' ? 'jpg' : type
}

export const formatToTitleCase = (str: string) => {
    if (!str) return str
    return str.replace(/\w\S*/g, (txt: string) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}

export const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob)
    anchorDownload(url, fileName)
}

export const anchorDownload = (url: string, fileName: string, target?: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    if (target) {
        a.target = target
    }
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
}

export const isImage = (fileExtension: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg']
    return imageExtensions.includes(fileExtension.toLowerCase())
}

export const generateBatches = <T>(list: T[], batchSize: number) => {
    return list.reduce((acc, operation, i) => {
        const batchIndex = Math.floor(i / batchSize)
        if (acc[batchIndex]) {
            acc[batchIndex] = [...acc[batchIndex], operation]
        } else {
            acc[batchIndex] = [operation]
        }
        return acc
    }, [] as T[][])
}

export const divideName = (fullname: string) => {
    const arr = fullname.trim().split(' ')
    const names = arr[0] + ' ' + arr[1] + ' '
    const first_sname = arr[2] ? arr[2] : ''
    const second_sname = arr[3] ? arr[3] : ''
    return {
        names: names,
        surnames: first_sname + ' ' + second_sname
    }
}

export const numberFormatter = new Intl.NumberFormat('es-ES', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
})

export const sanitizeFileName = (fileName: string): string => {
    return fileName.replace(/[^a-z0-9_\-]/gi, '_')
}