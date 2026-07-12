package kcg.edu.ehms.dto.common

import org.springframework.data.domain.Page

data class PageResponse<T>(
    val content: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val first: Boolean,
    val last: Boolean
) {
    companion object {
        fun <T : Any> from(pageData: Page<T>): PageResponse<T> = PageResponse(
            content = pageData.content,
            page = pageData.number,
            size = pageData.size,
            totalElements = pageData.totalElements,
            totalPages = pageData.totalPages,
            first = pageData.isFirst,
            last = pageData.isLast
        )
    }
}
