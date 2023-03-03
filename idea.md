// Entra na página de best seller
// Escolhe uma categoria
// Escolhe um produto com X número de avaliações
// Entra no produto
// Pega a descrição dele com innerText
// Entra no site reviews
// Pega as reviews - Pegar breadcrumb com categoria do produto - Pegar nome do produto

Appliances
Amazon Devices & Accessories
Arts, Crafts & Sewing
Automotive
Baby
Beauty & Personal Care
Camera & Photo Products
Cell Phones & Accessories
Computers & Accessories
Electronics
Home & Kitchen
Industrial & Scientific
Kitchen & Dining
Office Products
Patio, Lawn & Garden
Pet Supplies
Sports & Outdoors
Tools & Home Improvement
Toys & Games

Pesquisei amazon all departaments no google
Automative parei página 14
computers pagina 14

estava nesse link
https://www.amazon.com/s?i=kitchen-intl-ship&bbn=16225011011&rh=n%3A3206325011&s=review-count-rank&dc&ds=v1%3ArJzd8dG372Ncv7fFNkc6EcSayouGoyVsUwBdK%2FgCDY8&qid=1677865440&ref=sr_ex_n_1

https://www.amazon.com/s?i=kitchen-intl-ship&rh=n%3A3206325011&s=review-count-rank&dc&ds=v1%3ArJzd8dG372Ncv7fFNkc6EcSayouGoyVsUwBdK%2FgCDY8&qid=1677865440&ref=sr_ex_n_1

fui pra esse e aparece a breadcrumb pro departamento principal

const MINIMUM_AMOUNT_OF_REVIEWS = 10000;
const elementsWithMinimumAmountOfReviews = [];

document.querySelectorAll('[data-component-type=s-search-result]').forEach(item => {
const amountOfReviews = Number(item.querySelector('a[href*="#customerReviews"]')?.innerText.replace(',', '').replace('(', '').replace(')', ''))

    if (!!amountOfReviews && amountOfReviews > MINIMUM_AMOUNT_OF_REVIEWS) {
      elementsWithMinimumAmountOfReviews.push(item)
    }

})

console.log(elementsWithMinimumAmountOfReviews.map(item => item.querySelector('.a-link-normal.s-no-outline').href.split('/').slice(0, 6).join('/')).join('\n '))
