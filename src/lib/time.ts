export const formatDateTimeIST = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

export const formatTimeIST = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

export const formatDateIST = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export const getISTDateKey = (dateString: string) => {
    const date = new Date(dateString)

    const year = date.toLocaleString('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric'
    })

    const month = date.toLocaleString('en-CA', {
        timeZone: 'Asia/Kolkata',
        month: '2-digit'
    })

    const day = date.toLocaleString('en-CA', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit'
    })

    return `${year}-${month}-${day}` // 2026-02-12
}
